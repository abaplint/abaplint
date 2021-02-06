import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {EnhancementSpot} from "../../src/objects";

describe("Enhancement Spot, parse main xml", () => {

  it("Test parsing", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_ENHS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TOOL>BADI_DEF</TOOL>
   <SHORTTEXT>Test Linter</SHORTTEXT>
   <BADI_DATA>
    <ENH_BADI_DATA>
     <BADI_NAME>ZTEST_LINTER_BADI_DEF</BADI_NAME>
     <INTERFACE_NAME>ZIF_TEST_LINTER</INTERFACE_NAME>
     <CONTEXT_MODE>N</CONTEXT_MODE>
     <BADI_SHORTTEXT>BAdi Definition</BADI_SHORTTEXT>
     <BADI_SHORTTEXT_ID>0050563F2F631EDB99FC50958230D8E9</BADI_SHORTTEXT_ID>
    </ENH_BADI_DATA>
   </BADI_DATA>
   <SOTR>
    <item>
     <HEADER>
      <CONCEPT>0050563F2F631EDB99FC4E4999F8D8E8</CONCEPT>
      <CREA_LAN>E</CREA_LAN>
      <TRALA_TYPE>1</TRALA_TYPE>
      <OBJID_VEC>AAE=</OBJID_VEC>
     </HEADER>
     <ENTRIES>
      <SOTR_TEXT>
       <CONCEPT>0050563F2F631EDB99FC4E4999F8D8E8</CONCEPT>
       <LANGU>E</LANGU>
       <LFD_NUM>0001</LFD_NUM>
       <FLAG_CNTXT>X</FLAG_CNTXT>
       <STATUS>R</STATUS>
       <LENGTH>021</LENGTH>
       <TEXT>Test Linter</TEXT>
      </SOTR_TEXT>
     </ENTRIES>
    </item>
    <item>
     <HEADER>
      <CONCEPT>0050563F2F631EDB99FC50958230D8E9</CONCEPT>
      <CREA_LAN>E</CREA_LAN>
      <TRALA_TYPE>1</TRALA_TYPE>
      <OBJID_VEC>AAE=</OBJID_VEC>
     </HEADER>
     <ENTRIES>
      <SOTR_TEXT>
       <CONCEPT>0050563F2F631EDB99FC50958230D8E9</CONCEPT>
       <LANGU>E</LANGU>
       <LFD_NUM>0001</LFD_NUM>
       <FLAG_CNTXT>X</FLAG_CNTXT>
       <STATUS>R</STATUS>
       <LENGTH>025</LENGTH>
       <TEXT>BAdi Definition</TEXT>
      </SOTR_TEXT>
     </ENTRIES>
    </item>
   </SOTR>
   <SOTR_USE>
    <SOTR_USE>
     <PGMID>R3TR</PGMID>
     <OBJECT>ENHS</OBJECT>
     <OBJ_NAME>ZTEST_LINTER</OBJ_NAME>
     <CONCEPT>0050563F2F631EDB99FC4E4999F8D8E8</CONCEPT>
     <LFD_NUM>0001</LFD_NUM>
    </SOTR_USE>
    <SOTR_USE>
     <PGMID>R3TR</PGMID>
     <OBJECT>ENHS</OBJECT>
     <OBJ_NAME>ZTEST_LINTER</OBJ_NAME>
     <CONCEPT>0050563F2F631EDB99FC50958230D8E9</CONCEPT>
     <LFD_NUM>0001</LFD_NUM>
    </SOTR_USE>
   </SOTR_USE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("ztest_linter.enhs.xml", xml));
    await reg.parseAsync();
    const enhs = reg.getFirstObject()! as EnhancementSpot;
    expect(enhs).to.not.equal(undefined);
    const badis = enhs.listBadiDefinitions();
    expect(badis.length).to.equal(1);
    expect(badis[0].name).to.equal("ZTEST_LINTER_BADI_DEF");
    expect(badis[0].interface).to.equal("ZIF_TEST_LINTER");
  });

});