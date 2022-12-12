import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {LockObject} from "../../src/objects";

describe("ENQU, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_ENQU" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>E</AGGTYPE>
    <ROOTTAB>ZABAPGIT_UNIT_TE</ROOTTAB>
    <DDTEXT>Test</DDTEXT>
   </DD25V>
   <DD26E_TABLE>
    <DD26E>
     <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <TABPOS>0001</TABPOS>
     <FORTABNAME>ZABAPGIT_UNIT_TE</FORTABNAME>
     <ENQMODE>E</ENQMODE>
    </DD26E>
   </DD26E_TABLE>
   <DD27P_TABLE>
    <DD27P>
     <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
     <OBJPOS>0001</OBJPOS>
     <VIEWFIELD>MANDT</VIEWFIELD>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ENQMODE>E</ENQMODE>
    </DD27P>
    <DD27P>
     <VIEWNAME>EZABAPGIT_UNIT_T</VIEWNAME>
     <OBJPOS>0002</OBJPOS>
     <VIEWFIELD>BNAME</VIEWFIELD>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <FIELDNAME>BNAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ENQMODE>E</ENQMODE>
     <MEMORYID>XUS</MEMORYID>
    </DD27P>
   </DD27P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ezabapgit_unit_t.enqu.xml", xml));
    await reg.parseAsync();
    const enqu = reg.getFirstObject()! as LockObject;

    const tab = enqu.getPrimaryTable();
    expect(tab).to.not.equal(undefined);
    expect(tab).to.equal("ZABAPGIT_UNIT_TE");
  });

});