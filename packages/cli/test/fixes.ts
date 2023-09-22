import {expect} from "chai";
import * as memfs from "memfs";
import {Registry, MemoryFile, IRegistry, Config, Version} from "@abaplint/core";
import {ApplyFixes} from "../src/fixes";
import {PartialFS} from "../src/partial_fs";

async function applyFixes(reg: IRegistry, fs: PartialFS) {
  await new ApplyFixes().applyFixes(reg, fs, {quiet: true});
}

describe("Apply fixes", () => {
  it("test 1", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "CREATE OBJECT lo_obj.");
    const reg = new Registry().addFile(file).parse();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();
    const mockFS = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));

    await applyFixes(reg, mockFS);

    const result = mockFS.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.contain("NEW");
  });

  it("test 2, subsequent fix,", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "method( var1 = value1 var2 = value2 ).");
    const reg = new Registry().addFile(file).parse();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    await applyFixes(reg, input);

    const result = input.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.equal(`method( var1 = value1\n        var2 = value2 ).`);
  });

  it("test 3, overlapping fixes", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "DATA: foo, bar.");
    const reg = new Registry().addFile(file).parse();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    await applyFixes(reg, input);

    const result = input.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.equal(``);
  });

  it.skip("test 4, more overlapping fixes", async () => {
    const abap = `FORM foo.
  DATA:
    lv_key              TYPE string,
    lv_branch           TYPE string,
    lv_selected_commit  TYPE string,
    lv_commit_short_sha TYPE string,
    lv_text             TYPE string,
    lv_class            TYPE string.

  IF 1 = 2.
    lv_key = |abc|.
  ENDIF.
  lv_branch = |abc|.
  lv_selected_commit = |abc|.
  lv_commit_short_sha = |abc|.
  lv_text = |abc|.
  lv_class = |abc|.
ENDFORM.`;
    const file = new MemoryFile("zfoobar.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    await applyFixes(reg, input);

    const result = input.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.equal(`FORM foo.


  IF 1 = 2.
    DATA(lv_key) = |abc|.
  ENDIF.
  DATA(lv_branch) = |abc|.
  DATA(lv_selected_commit) = |abc|.
  DATA(lv_commit_short_sha) = |abc|.
  DATA(lv_text) = |abc|.
  DATA(lv_class) = |abc|.
ENDFORM.`);
  });

  it("must not fix excluded object", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "CREATE OBJECT lo_obj.");
    const reg = new Registry().addFile(file);

    const config = reg.getConfig().get();
    config.rules["use_new"].exclude = ["zfoobar"];
    reg.setConfig(new Config(JSON.stringify(config)));

    reg.parse();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();
    const mockFS = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));

    await applyFixes(reg, mockFS);

    const result = mockFS.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.contain("CREATE OBJECT");
  });

  it("after fixing, there should be no syntax errors", async () => {
    const prog = new MemoryFile("zfoobar.prog.abap", "zcl_bar=>run( ).");
    const clas = new MemoryFile("zcl_bar.clas.abap", `
CLASS zcl_bar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.

CLASS zcl_bar IMPLEMENTATION.
  METHOD run.
    DATA lt_queue TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    LOOP AT lt_queue ASSIGNING FIELD-SYMBOL(<ls_queue>).
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.    `);
    const reg = new Registry().addFile(prog).addFile(clas);

    const config = reg.getConfig().get();
    config.syntax.version = Version.v702;
    reg.setConfig(new Config(JSON.stringify(config)));

    reg.parse();

    const jsonFiles: any = {};
    jsonFiles[prog.getFilename()] = prog.getRaw();
    const mockFS = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));

    await applyFixes(reg, mockFS);

    const syntax = reg.findIssues().filter(i => i.getKey() === "check_syntax");
    expect(syntax.length).to.equal(0);
  });
});