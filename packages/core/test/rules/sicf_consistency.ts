import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {SICFConsistency} from "../../src/rules";
import {expect} from "chai";

describe("rule, sicf_consistency, error", () => {
  it("test", () => {
    const reg = new Registry().addFile(new MemoryFile("zabapgitserver 9def6c78d0beedf8d5b04ba6c.sicf.xml", `blah`));
    const rule = new SICFConsistency();
    const issues = rule.initialize(reg).run(reg.getObjects()[0]);

    expect(issues.length).to.equals(0);
  });
});

const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SICF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/sap/zabapgitserver/</URL>
   <ICFSERVICE>
    <ICF_NAME>ZABAPGITSERVER</ICF_NAME>
    <FALLTHRU>X</FALLTHRU>
    <ORIG_NAME>zabapgitserver</ORIG_NAME>
   </ICFSERVICE>
   <ICFDOCU>
    <ICF_NAME>ZABAPGITSERVER</ICF_NAME>
    <ICF_LANGU>E</ICF_LANGU>
    <ICF_DOCU>abapGitServer</ICF_DOCU>
   </ICFDOCU>
   <ICFHANDLER_TABLE>
    <ICFHANDLER>
     <ICF_NAME>ZABAPGITSERVER</ICF_NAME>
     <ICFORDER>01</ICFORDER>
     <ICFTYP>A</ICFTYP>
     <ICFHANDLER>ZCL_AGS_SICF</ICFHANDLER>
    </ICFHANDLER>
   </ICFHANDLER_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

describe("rule, sicf_consistency, handler not found", () => {
  it("test", () => {
    const reg = new Registry().addFile(new MemoryFile("zabapgitserver 9def6c78d0beedf8d5b04ba6c.sicf.xml", xml));
    const rule = new SICFConsistency();
    const issues = rule.initialize(reg).run(reg.getObjects()[0]);
    expect(issues.length).to.equals(1);
  });
});

const abap = `
CLASS ZCL_AGS_SICF DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_http_extension.
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.

CLASS ZCL_AGS_SICF IMPLEMENTATION.
ENDCLASS.`;

describe("rule, sicf_consistency, handler ok", () => {
  it("test", async () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zabapgitserver 9def6c78d0beedf8d5b04ba6c.sicf.xml", xml));
    reg.addFile(new MemoryFile("zcl_ags_sicf.clas.abap", abap));
    await reg.parseAsync();

    const rule = new SICFConsistency();
    const issues = rule.initialize(reg).run(reg.getObjects()[0]);

    expect(issues.length).to.equals(0);
  });
});

