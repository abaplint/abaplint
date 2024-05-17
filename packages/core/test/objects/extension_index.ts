import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ExtensionIndex} from "../../src/objects";

describe("Extension index, parse main xml", () => {

  it("test", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_XINX" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <XINX>
    <DD12V>
     <SQLTAB>T005</SQLTAB>
     <INDEXNAME>Z00</INDEXNAME>
     <AS4LOCAL>A</AS4LOCAL>
     <DDLANGUAGE>E</DDLANGUAGE>
     <DBINDEX>T005~Z00</DBINDEX>
     <DDTEXT>Test</DDTEXT>
     <ISEXTIND>X</ISEXTIND>
    </DD12V>
    <T_DD17V>
     <DD17V>
      <SQLTAB>T005</SQLTAB>
      <INDEXNAME>Z00</INDEXNAME>
      <POSITION>0001</POSITION>
      <AS4LOCAL>A</AS4LOCAL>
      <FIELDNAME>NMFMT</FIELDNAME>
     </DD17V>
    </T_DD17V>
   </XINX>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("t005 z00.xinx.xml", xml));
    await reg.parseAsync();
    const xinx = reg.getFirstObject()! as ExtensionIndex;
    expect(xinx.getDescription()).to.equal("Test");
    expect(xinx.getTableName()).to.equal("T005");
  });

});