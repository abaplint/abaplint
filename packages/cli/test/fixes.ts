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
});