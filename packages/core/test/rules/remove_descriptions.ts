import {Registry} from "../../src/registry";
import {RemoveDescriptions} from "../../src/rules";
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";

describe("rule, remove_descriptions, one error", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <VSEOCLASS>
        <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
        <VERSION>1</VERSION>
        <LANGU>E</LANGU>
        <DESCRIPT>Settings</DESCRIPT>
        <STATE>1</STATE>
        <CLSCCINCL>X</CLSCCINCL>
        <FIXPT>X</FIXPT>
        <UNICODE>X</UNICODE>
        <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>
       </VSEOCLASS>
       <DESCRIPTIONS>
        <SEOCOMPOTX>
         <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
         <CMPNAME>GO_PERSIST</CMPNAME>
         <LANGU>E</LANGU>
         <DESCRIPT>Settings</DESCRIPT>
        </SEOCOMPOTX>
       </DESCRIPTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;

  const abap = `
CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.
ENDCLASS.
CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.
ENDCLASS.`;

  it("remove_descriptions test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
    reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
    await reg.parseAsync();
    const rule = new RemoveDescriptions();
    const issues = rule.run(reg.getFirstObject()!);

    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("GO_PERSIS");
  });
});

describe("rule, remove_descriptions, no error", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <VSEOCLASS>
        <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
        <VERSION>1</VERSION>
        <LANGU>E</LANGU>
        <DESCRIPT>Settings</DESCRIPT>
        <STATE>1</STATE>
        <CLSCCINCL>X</CLSCCINCL>
        <FIXPT>X</FIXPT>
        <UNICODE>X</UNICODE>
        <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>
       </VSEOCLASS>
      </asx:values>
     </asx:abap>
    </abapGit>`;

  const abap = `
CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.
ENDCLASS.
CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.
ENDCLASS.`;

  it("remove_descriptions test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
    reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
    await reg.parseAsync();
    const rule = new RemoveDescriptions();
    const issues = rule.run(reg.getFirstObject()!);

    expect(issues.length).to.equals(0);
  });
});

describe("rule, remove_descriptions, 2 errors", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <VSEOCLASS>
        <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
        <VERSION>1</VERSION>
        <LANGU>E</LANGU>
        <DESCRIPT>Settings</DESCRIPT>
        <STATE>1</STATE>
        <CLSCCINCL>X</CLSCCINCL>
        <FIXPT>X</FIXPT>
        <UNICODE>X</UNICODE>
        <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>
       </VSEOCLASS>
       <DESCRIPTIONS>
        <SEOCOMPOTX>
         <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
         <CMPNAME>GO_PERSIST</CMPNAME>
         <LANGU>E</LANGU>
         <DESCRIPT>Settings</DESCRIPT>
        </SEOCOMPOTX>
        <SEOCOMPOTX>
         <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
         <CMPNAME>SOMETHING_ELSE</CMPNAME>
         <LANGU>E</LANGU>
         <DESCRIPT>Settings</DESCRIPT>
        </SEOCOMPOTX>
       </DESCRIPTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;
  const abap = `CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.
    ENDCLASS.
    CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.
    ENDCLASS.`;

  it("remove_descriptions test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
    reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
    await reg.parseAsync();
    const rule = new RemoveDescriptions();
    const issues = rule.run(reg.getFirstObject()!);

    expect(issues.length).to.equals(2);
  });
});

describe("rule, remove_descriptions, skip error as its a workflow class", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <VSEOCLASS>
        <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
        <VERSION>1</VERSION>
        <LANGU>E</LANGU>
        <DESCRIPT>Settings</DESCRIPT>
        <STATE>1</STATE>
        <CLSCCINCL>X</CLSCCINCL>
        <FIXPT>X</FIXPT>
        <UNICODE>X</UNICODE>
        <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>
       </VSEOCLASS>
       <DESCRIPTIONS>
        <SEOCOMPOTX>
         <CLSNAME>ZCL_ABAPGIT_PERSIST_SETTINGS</CLSNAME>
         <CMPNAME>GO_PERSIST</CMPNAME>
         <LANGU>E</LANGU>
         <DESCRIPT>Settings</DESCRIPT>
        </SEOCOMPOTX>
       </DESCRIPTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;

  const abap = `
CLASS zcl_abapgit_persist_settings DEFINITION PUBLIC CREATE PRIVATE.
  PUBLIC SECTION.
  INTERFACES if_workflow.
ENDCLASS.
CLASS ZCL_ABAPGIT_PERSIST_SETTINGS IMPLEMENTATION.
ENDCLASS.`;

  it("remove_descriptions test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.xml", xml));
    reg.addFile(new MemoryFile("zcl_abapgit_persist_settings.clas.abap", abap));
    await reg.parseAsync();
    const rule = new RemoveDescriptions();
    const issues = rule.run(reg.getFirstObject()!);

    expect(issues.length).to.equals(0);
  });
});