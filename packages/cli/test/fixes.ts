import {expect} from "chai";
import * as memfs from "memfs";
import {Registry, MemoryFile} from "@abaplint/core";
import {applyFixes} from "../src/fixes";

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

});