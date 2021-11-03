import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {LanguageServer} from "../../src";

describe("LSP, statement flow", () => {

  it("basic", async () => {
    const abap = `
    CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      PUBLIC SECTION.
        METHODS method1.
        METHODS method2.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
      METHOD method1.
        WRITE 'sdf'.
      ENDMETHOD.
      METHOD method2.
        DATA foo.
      ENDMETHOD.
    ENDCLASS.
    `;
    const file = new MemoryFile("zcl_foobar.clas.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const dump = new LanguageServer(reg).dumpStatementFlows({uri: file.getFilename()});
    expect(dump).to.equal(`[[Write],
[Data]]`);
  });

});