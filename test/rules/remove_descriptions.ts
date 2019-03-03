import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {RemoveDescriptions} from "../../src/rules";
import {expect} from "chai";

describe("rule, remove_descriptions, one error", function () {
  const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
    " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
    "  <asx:values>\n" +
    "   <VSEOCLASS>\n" +
    "    <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>\n" +
    "    <VERSION>1</VERSION>\n" +
    "    <LANGU>E</LANGU>\n" +
    "    <DESCRIPT>Settings</DESCRIPT>\n" +
    "    <STATE>1</STATE>\n" +
    "    <CLSCCINCL>X</CLSCCINCL>\n" +
    "    <FIXPT>X</FIXPT>\n" +
    "    <UNICODE>X</UNICODE>\n" +
    "    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>\n" +
    "   </VSEOCLASS>\n" +
    "   <DESCRIPTIONS>\n" +
    "    <SEOCOMPOTX>\n" +
    "     <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>\n" +
    "     <CMPNAME>GO_PERSIST</CMPNAME>\n" +
    "     <LANGU>E</LANGU>\n" +
    "     <DESCRIPT>Settings</DESCRIPT>\n" +
    "    </SEOCOMPOTX>\n" +
    "   </DESCRIPTIONS>\n" +
    "  </asx:values>\n" +
    " </asx:abap>\n" +
    "</abapGit>";

  const abap = "CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.\n" +
    "ENDCLASS.\n" +
    "CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.\n" +
    "ENDCLASS.";

  const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
  reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
  reg.parse();
  const rule = new RemoveDescriptions();
  const issues = rule.run(reg.getObjects()[0]);
  it("remove_descriptions test", () => {
    expect(issues.length).to.equals(1);
  });
});

describe("rule, remove_descriptions, no error", function () {
  const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
    " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
    "  <asx:values>\n" +
    "   <VSEOCLASS>\n" +
    "    <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>\n" +
    "    <VERSION>1</VERSION>\n" +
    "    <LANGU>E</LANGU>\n" +
    "    <DESCRIPT>Settings</DESCRIPT>\n" +
    "    <STATE>1</STATE>\n" +
    "    <CLSCCINCL>X</CLSCCINCL>\n" +
    "    <FIXPT>X</FIXPT>\n" +
    "    <UNICODE>X</UNICODE>\n" +
    "    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>\n" +
    "   </VSEOCLASS>\n" +
    "  </asx:values>\n" +
    " </asx:abap>\n" +
    "</abapGit>";

  const abap = "CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.\n" +
    "ENDCLASS.\n" +
    "CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.\n" +
    "ENDCLASS.";

  const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
  reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
  reg.parse();
  const rule = new RemoveDescriptions();
  const issues = rule.run(reg.getObjects()[0]);
  it("remove_descriptions test", () => {
    expect(issues.length).to.equals(0);
  });
});

describe("rule, remove_descriptions, 2 errors", function () {
  const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
    " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
    "  <asx:values>\n" +
    "   <VSEOCLASS>\n" +
    "    <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>\n" +
    "    <VERSION>1</VERSION>\n" +
    "    <LANGU>E</LANGU>\n" +
    "    <DESCRIPT>Settings</DESCRIPT>\n" +
    "    <STATE>1</STATE>\n" +
    "    <CLSCCINCL>X</CLSCCINCL>\n" +
    "    <FIXPT>X</FIXPT>\n" +
    "    <UNICODE>X</UNICODE>\n" +
    "    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>\n" +
    "   </VSEOCLASS>\n" +
    "   <DESCRIPTIONS>\n" +
    "    <SEOCOMPOTX>\n" +
    "     <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>\n" +
    "     <CMPNAME>GO_PERSIST</CMPNAME>\n" +
    "     <LANGU>E</LANGU>\n" +
    "     <DESCRIPT>Settings</DESCRIPT>\n" +
    "    </SEOCOMPOTX>\n" +
    "    <SEOCOMPOTX>\n" +
    "     <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>\n" +
    "     <CMPNAME>SOMETHING_ELSE</CMPNAME>\n" +
    "     <LANGU>E</LANGU>\n" +
    "     <DESCRIPT>Settings</DESCRIPT>\n" +
    "    </SEOCOMPOTX>\n" +
    "   </DESCRIPTIONS>\n" +
    "  </asx:values>\n" +
    " </asx:abap>\n" +
    "</abapGit>";

  const abap = "CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.\n" +
    "ENDCLASS.\n" +
    "CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.\n" +
    "ENDCLASS.";

  const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
  reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
  reg.parse();
  const rule = new RemoveDescriptions();
  const issues = rule.run(reg.getObjects()[0]);
  it("remove_descriptions test", () => {
    expect(issues.length).to.equals(2);
  });
});