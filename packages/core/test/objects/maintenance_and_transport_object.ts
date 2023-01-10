import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {MaintenanceAndTransportObject} from "../../src/objects";

describe("TOBJ, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TOBJ" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <OBJH>
    <OBJECTNAME>ZABAPGIT_UNIT_TE</OBJECTNAME>
    <OBJECTTYPE>S</OBJECTTYPE>
    <CLIDEP>X</CLIDEP>
    <OBJCATEG>APPL</OBJCATEG>
    <IMPORTABLE>3</IMPORTABLE>
   </OBJH>
   <OBJT>
    <LANGUAGE>E</LANGUAGE>
    <OBJECTNAME>ZABAPGIT_UNIT_TE</OBJECTNAME>
    <OBJECTTYPE>S</OBJECTTYPE>
    <DDTEXT>unit test</DDTEXT>
   </OBJT>
   <OBJS>
    <OBJS>
     <OBJECTNAME>ZABAPGIT_UNIT_TE</OBJECTNAME>
     <OBJECTTYPE>S</OBJECTTYPE>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <DDIC>X</DDIC>
     <PRIM_TABLE>X</PRIM_TABLE>
    </OBJS>
   </OBJS>
   <TOBJ>
    <TDDAT>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <CCLASS>&amp;NC&amp;</CCLASS>
    </TDDAT>
    <TVDIR>
     <TABNAME>ZABAPGIT_UNIT_TE</TABNAME>
     <AREA>ZABAPGIT_UNIT_TE</AREA>
     <TYPE>2</TYPE>
     <LISTE>0001</LISTE>
     <DETAIL>0002</DETAIL>
     <BASTAB>X</BASTAB>
     <FLAG>X</FLAG>
    </TVDIR>
   </TOBJ>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zabapgit_unit_tes.tobj.xml", xml));
    await reg.parseAsync();
    const tobj = reg.getFirstObject()! as MaintenanceAndTransportObject;

    expect(tobj.getArea()).to.equal("ZABAPGIT_UNIT_TE");
    expect(tobj.getObjectName()).to.equal("ZABAPGIT_UNIT_TE");
    expect(tobj.getObjectType()).to.equal("S");
  });

});