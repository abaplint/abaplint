import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {CodeLens} from "../../src/lsp/code_lens";

const filename: string = "codelens.prog.abap";

const xml =
"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
"<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_MSAG\" serializer_version=\"v1.0.0\">\n" +
" <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
"  <asx:values>\n" +
"   <T100A>\n" +
"    <ARBGB>ZAG_UNIT_TEST</ARBGB>\n" +
"    <MASTERLANG>E</MASTERLANG>\n" +
"    <STEXT>test</STEXT>\n" +
"   </T100A>\n" +
"   <T100>\n" +
"    <T100>\n" +
"     <SPRSL>E</SPRSL>\n" +
"     <ARBGB>ZAG_UNIT_TEST</ARBGB>\n" +
"     <MSGNR>000</MSGNR>\n" +
"     <TEXT>hello world &amp;</TEXT>\n" +
"    </T100>\n" +
"   </T100>\n" +
"  </asx:values>\n" +
" </asx:abap>\n" +
"</abapGit>";

describe("LSP, Code Lens", () => {

  it("parser error", () => {
    const file = new MemoryFile(filename, "sdfsdfds");
    const reg = new Registry().addFile(file).parse();
    const found = new CodeLens(reg).list({uri: filename});
    expect(found.length).to.equal(0);
  });

  it("find it", () => {
    const file = new MemoryFile(filename, "MESSAGE e000(zag_unit_test).");
    const msag = new MemoryFile("zag_unit_test.msag.xml", xml);
    const reg = new Registry().addFiles([file, msag]).parse();
    const found = new CodeLens(reg).list({uri: filename});
    expect(found.length).to.equal(1);
  });

  it("Dynamic exception", () => {
    const file = new MemoryFile(filename, `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo EXCEPTIONS cx_dynamic_check.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  lcl=>foo( ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new CodeLens(reg).list({uri: filename});
    expect(found.length).to.equal(1);
    expect(found[0]?.command?.title).to.include("CX_DYNAMIC_CHECK");
  });

});