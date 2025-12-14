/* eslint-disable max-len */
import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ProxyObject} from "../../src/objects";

describe("Proxy Object", () => {

  it("basic INTF", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SPRX" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROXY_HEADER>
    <item>
     <OBJECT>INTF</OBJECT>
     <OBJ_NAME>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME>
     <OBJECT_M>INTF</OBJECT_M>
     <OBJ_NAME_M>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME_M>
     <HASH_ID>8B0CCCE285BFCE420487A49BBB720AC8A28C0A5B</HASH_ID>
     <ID>dummy</ID>
     <IFR_GLOBAL>X</IFR_GLOBAL>
     <IFR_TYPE>portType</IFR_TYPE>
     <IFR_NAME>SI_Trigger_FileInfo_in</IFR_NAME>
     <IFR_NSPCE>dummy</IFR_NSPCE>
     <IFR_GNSPCE>dummy</IFR_GNSPCE>
     <GEN_VERS>0006</GEN_VERS>
     <PREFIX>ZPO_</PREFIX>
     <CATEGORY>ifmmessif</CATEGORY>
     <DIRECTION>I</DIRECTION>
     <X-ML_NSPCE>dummy</X-ML_NSPCE>
     <X-ML_NAME>SI_Trigger_FileInfo_in</X-ML_NAME>
     <FURTHER_DATA>&lt;asx:abap xmlns:asx=&quot;http://www.sap.com/abapxml&quot; version=&quot;1.0&quot;&gt;&lt;asx:values&gt;&lt;DATA&gt;&lt;SOAP_APPL&gt;urn:sap-com:soap:application:esr:server:710&lt;/SOAP_APPL&gt;&lt;/DATA&gt;&lt;/asx:values&gt;&lt;/asx:abap&gt;</FURTHER_DATA>
     <VERSION_ID>11ca6309c55111f0ac15000006230ed3</VERSION_ID>
    </item>
   </PROXY_HEADER>
   <PROXY_DATA>
    <item>
     <OBJECT>INTF</OBJECT>
     <OBJ_NAME>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME>
     <OBJECT1>CLAS</OBJECT1>
     <OBJ_NAME1>ZPO_CL_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME1>
     <OBJECT2>CLAS</OBJECT2>
     <OBJ_NAME2>ZPO_CL_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME2>
     <ID>dummy</ID>
     <IFR_TYPE>CLIM</IFR_TYPE>
     <IFR_NAME>SI_Trigger_FileInfo_in</IFR_NAME>
     <IFR_LANGU>EN</IFR_LANGU>
     <R3_TYPE>CLAS</R3_TYPE>
     <R3_NAME>ZPO_CL_SI_TRIGGER_FILE_INFO_IN</R3_NAME>
     <R3_TEXT>Proxy Class (generated)</R3_TEXT>
    </item>
    <item>
     <OBJECT>INTF</OBJECT>
     <OBJ_NAME>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME>
     <OBJECT1>INTF</OBJECT1>
     <OBJ_NAME1>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME1>
     <OBJECT2>INTF</OBJECT2>
     <OBJ_NAME2>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME2>
     <ID>dummy</ID>
     <IFR_TYPE>portType</IFR_TYPE>
     <IFR_NAME>SI_Trigger_FileInfo_in</IFR_NAME>
     <IFR_LANGU>EN</IFR_LANGU>
     <IFR_SCALE>-2</IFR_SCALE>
     <R3_TYPE>INTF</R3_TYPE>
     <R3_NAME>ZPO_II_SI_TRIGGER_FILE_INFO_IN</R3_NAME>
     <R3_TEXT>Proxy Interface (generated)</R3_TEXT>
     <CATEGORY>ifmmessif</CATEGORY>
     <DIRECTION>I</DIRECTION>
    </item>
    <item>
     <OBJECT>INTF</OBJECT>
     <OBJ_NAME>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME>
     <OBJECT1>METH</OBJECT1>
     <OBJ_NAME1>SI_TRIGGER_FILE_INFO_IN</OBJ_NAME1>
     <OBJECT2>METH</OBJECT2>
     <OBJ_NAME2>SI_TRIGGER_FILE_INFO_IN</OBJ_NAME2>
     <ID>dummy</ID>
     <IFR_TYPE>operation</IFR_TYPE>
     <IFR_NAME>SI_Trigger_FileInfo_in</IFR_NAME>
     <IFR_LANGU>EN</IFR_LANGU>
     <IFR_SCALE>-2</IFR_SCALE>
     <R3_TYPE>METH</R3_TYPE>
     <R3_NAME>SI_TRIGGER_FILE_INFO_IN</R3_NAME>
     <R3_SEQNUM>000001</R3_SEQNUM>
     <DIRECTION>I</DIRECTION>
    </item>
    <item>
     <OBJECT>INTF</OBJECT>
     <OBJ_NAME>ZPO_II_SI_TRIGGER_FILE_INFO_IN</OBJ_NAME>
     <OBJECT1>METH</OBJECT1>
     <OBJ_NAME1>SI_TRIGGER_FILE_INFO_IN</OBJ_NAME1>
     <OBJECT2>PAIM</OBJECT2>
     <OBJ_NAME2>INPUT</OBJ_NAME2>
     <OBJECT_R>TABL</OBJECT_R>
     <OBJ_NAME_R>ZPO_MT_INFO_FILE</OBJ_NAME_R>
     <ID>dummy</ID>
     <IFR_TYPE>PartInput</IFR_TYPE>
     <IFR_NAME>input</IFR_NAME>
     <IFR_SCALE>-2</IFR_SCALE>
     <R3_TYPE>PAIM</R3_TYPE>
     <R3_NAME>INPUT</R3_NAME>
     <R3_SEQNUM>000001</R3_SEQNUM>
    </item>
   </PROXY_DATA>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("intfzpo_ii_si_trigger_file_info_in.sprx.xml", xml));
    await reg.parseAsync();
    const proxy = reg.getFirstObject() as ProxyObject;
    const generateObjects = proxy.generateABAPObjects();
    expect(generateObjects.length).to.equal(1);
    expect(generateObjects[0].getType()).to.equal("INTF");
    const intfName = generateObjects[0].getName();
    expect(intfName).to.equal("ZPO_II_SI_TRIGGER_FILE_INFO_IN");

    const intfCode = `INTERFACE zpo_ii_si_trigger_file_info_in PUBLIC.
  METHODS si_trigger_file_info_in
    IMPORTING
      input TYPE zpo_mt_info_file .
ENDINTERFACE.`;
    expect(generateObjects[0].getFiles()[0].getRaw().trim()).to.equal(intfCode);

// try triggering parse again, to check it doesnt crash
    await reg.parseAsync();
  });

});