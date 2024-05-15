import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {EnhancementImplementation} from "../../src/objects";

describe("Enhancement implementation, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_ENHO" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TOOL>CLASENH</TOOL>
   <SHORTTEXT>enhancement</SHORTTEXT>
   <CLASS>ZCL_TEST_CLAS_WITH_ENHO</CLASS>
   <PRE_METHODS>
    <ENHAMETHKEYS>
     <METHKEY>
      <CLSNAME>ZCL_TEST_CLAS_WITH_ENHO</CLSNAME>
      <CMPNAME>RUN</CMPNAME>
     </METHKEY>
    </ENHAMETHKEYS>
   </PRE_METHODS>
   <TAB_ATTRIBUTES>
    <ENHCLASSATTRIB>
     <CLSNAME>ZCL_TEST_CLAS_WITH_ENHO</CLSNAME>
     <CMPNAME>%_Z_ENH</CMPNAME>
     <DESCRIPT>SAP-generated, not changeable!</DESCRIPT>
     <STATE>1</STATE>
     <EDITORDER>1</EDITORDER>
     <TYPTYPE>3</TYPTYPE>
     <TYPE>OBJECT</TYPE>
     <LOCKED>X</LOCKED>
    </ENHCLASSATTRIB>
   </TAB_ATTRIBUTES>
   <SOTR>
    <item>
     <HEADER>
      <CONCEPT>000D3A8FA0651EEBA09C2E7A1323A8E0</CONCEPT>
      <CREA_LAN>E</CREA_LAN>
      <TRALA_TYPE>1</TRALA_TYPE>
      <OBJID_VEC>AAI=</OBJID_VEC>
     </HEADER>
     <ENTRIES>
      <SOTR_TEXT>
       <CONCEPT>000D3A8FA0651EEBA09C2E7A1323A8E0</CONCEPT>
       <LANGU>E</LANGU>
       <LFD_NUM>0001</LFD_NUM>
       <FLAG_CNTXT>X</FLAG_CNTXT>
       <STATUS>R</STATUS>
       <LENGTH>045</LENGTH>
       <TEXT>SAP-generated, not changeable!</TEXT>
      </SOTR_TEXT>
     </ENTRIES>
    </item>
    <item>
     <HEADER>
      <CONCEPT>000D3A8FA0651EEBA09C2E7A132488E0</CONCEPT>
      <CREA_LAN>E</CREA_LAN>
      <TRALA_TYPE>1</TRALA_TYPE>
      <OBJID_VEC>AAI=</OBJID_VEC>
     </HEADER>
     <ENTRIES>
      <SOTR_TEXT>
       <CONCEPT>000D3A8FA0651EEBA09C2E7A132488E0</CONCEPT>
       <LANGU>E</LANGU>
       <LFD_NUM>0001</LFD_NUM>
       <FLAG_CNTXT>X</FLAG_CNTXT>
       <STATUS>R</STATUS>
       <LENGTH>021</LENGTH>
       <TEXT>enhancement</TEXT>
      </SOTR_TEXT>
     </ENTRIES>
    </item>
   </SOTR>
   <SOTR_USE>
    <SOTR_USE>
     <PGMID>R3TR</PGMID>
     <OBJECT>ENHO</OBJECT>
     <OBJ_NAME>Z_ENH</OBJ_NAME>
     <CONCEPT>000D3A8FA0651EEBA09C2E7A1323A8E0</CONCEPT>
     <LFD_NUM>0001</LFD_NUM>
    </SOTR_USE>
    <SOTR_USE>
     <PGMID>R3TR</PGMID>
     <OBJECT>ENHO</OBJECT>
     <OBJ_NAME>Z_ENH</OBJ_NAME>
     <CONCEPT>000D3A8FA0651EEBA09C2E7A132488E0</CONCEPT>
     <LFD_NUM>0001</LFD_NUM>
    </SOTR_USE>
   </SOTR_USE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("z_enh.enho.xml", xml));
    await reg.parseAsync();
    const tran = reg.getFirstObject()! as EnhancementImplementation;

    expect(tran.getDescription()).to.equal("enhancement");
    expect(tran.getClassName()).to.equal("ZCL_TEST_CLAS_WITH_ENHO");
  });

});