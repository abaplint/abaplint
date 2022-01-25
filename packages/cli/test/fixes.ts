import {expect} from "chai";
import * as memfs from "memfs";
import {Registry, MemoryFile, Issue, IRegistry} from "@abaplint/core";
import {ApplyFixes, MyFS} from "../src/fixes";

function applyFixes(inputIssues: readonly Issue[], reg: IRegistry, fs: MyFS) {
  new ApplyFixes().applyFixes(inputIssues, reg, fs);
}

describe("Apply fixes", () => {
  it("test 1", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "CREATE OBJECT lo_obj.");
    const reg = new Registry().addFile(file).parse();
    const issues = reg.findIssues();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    applyFixes(issues, reg, input);

    const result = input.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.contain("NEW");
  });

  it("test 2, subsequent fix,", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "method( var1 = value1 var2 = value2 ).");
    const reg = new Registry().addFile(file).parse();
    const issues = reg.findIssues();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    applyFixes(issues, reg, input);

    const result = input.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.equal(`method( var1 = value1\n        var2 = value2 ).`);
  });

  it("test 3, overlapping fixes", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "DATA: foo, bar.");
    const reg = new Registry().addFile(file).parse();
    const issues = reg.findIssues();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    applyFixes(issues, reg, input);

    const result = input.readFileSync("zfoobar.prog.abap").toString();
    expect(result).to.equal(``);
  });

  it("test 4, more overlapping fixes", () => {
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
    const issues = reg.findIssues();

    const jsonFiles: any = {};
    jsonFiles[file.getFilename()] = file.getRaw();

    const input = memfs.createFsFromVolume(memfs.Volume.fromJSON(jsonFiles));
    applyFixes(issues, reg, input);

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
});