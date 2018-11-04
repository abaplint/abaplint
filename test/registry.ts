import {Registry} from "../src/registry";
import {MemoryFile} from "../src/files";
import {expect} from "chai";

describe("Registry", () => {

  it("Parse ABAP file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "IF moo = boo. ENDIF.");
    let abap = new Registry().addFile(file).parse().getABAPFiles();
    expect(abap.length).to.equal(1);
    expect(abap[0].getStatements().length).to.equal(2);
    expect(abap[0].getStructure()).to.not.equal(undefined);
  });

});