import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MessageClass} from "../../src/objects";

describe("Message Class, parse XML", () => {
  it("test", () => {
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

    const reg = new Registry().addFile(new MemoryFile("zag_unit_test.msag.xml", xml)).parse();
    const msag = reg.getObjects()[0] as MessageClass;
    expect(msag.getName()).to.equal("ZAG_UNIT_TEST");
    const messages = msag.getMessages();
    expect(messages.length).to.equal(1);
    expect(messages[0].getNumber()).to.equal("000");
    expect(messages[0].getMessage()).to.equal("hello world &");
  });

  it("empty text", () => {
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
      "     <MSGNR>001</MSGNR>\n" +
      "    </T100>\n" +
      "   </T100>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";

    const reg = new Registry().addFile(new MemoryFile("zag_unit_test.msag.xml", xml)).parse();
    const msag = reg.getObjects()[0] as MessageClass;
    expect(msag.getName()).to.equal("ZAG_UNIT_TEST");
    const messages = msag.getMessages();
    expect(messages.length).to.equal(1);
    expect(messages[0].getNumber()).to.equal("001");
    expect(messages[0].getMessage()).to.equal("");
  });
});