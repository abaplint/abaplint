import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {View} from "../../src/objects";
import {StructureType} from "../../src/abap/types/basic/structure_type";

describe("View, parse XML", () => {
  it("test", async () => {
    const xml =
      `<?xml version="1.0" encoding="utf-8"?>
      <abapGit version="v1.0.0" serializer="LCL_OBJECT_VIEW" serializer_version="v1.0.0">
       <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
        <asx:values>
         <DD25V>
          <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>
          <AS4LOCAL>A</AS4LOCAL>
          <DDLANGUAGE>E</DDLANGUAGE>
          <AGGTYPE>V</AGGTYPE>
          <ROOTTAB>TADIR</ROOTTAB>
          <DDTEXT>unit test</DDTEXT>
          <VIEWCLASS>D</VIEWCLASS>
          <VIEWGRANT>R</VIEWGRANT>
         </DD25V>
         <DD26V_TABLE>
          <DD26V>
           <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>
           <TABNAME>TADIR</TABNAME>
           <TABPOS>0001</TABPOS>
           <FORTABNAME>TADIR</FORTABNAME>
          </DD26V>
         </DD26V_TABLE>
         <DD27P_TABLE>
          <DD27P>
           <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>
           <OBJPOS>0001</OBJPOS>
           <DDLANGUAGE>E</DDLANGUAGE>
           <VIEWFIELD>PGMID</VIEWFIELD>
           <TABNAME>TADIR</TABNAME>
           <FIELDNAME>PGMID</FIELDNAME>
           <KEYFLAG>X</KEYFLAG>
           <ROLLNAME>PGMID</ROLLNAME>
           <ROLLNAMEVI>PGMID</ROLLNAMEVI>
          </DD27P>
          <DD27P>
           <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>
           <OBJPOS>0002</OBJPOS>
           <DDLANGUAGE>E</DDLANGUAGE>
           <VIEWFIELD>OBJECT</VIEWFIELD>
           <TABNAME>TADIR</TABNAME>
           <FIELDNAME>OBJECT</FIELDNAME>
           <KEYFLAG>X</KEYFLAG>
           <ROLLNAME>TROBJTYPE</ROLLNAME>
           <ROLLNAMEVI>TROBJTYPE</ROLLNAMEVI>
           <SHLPORIGIN>X</SHLPORIGIN>
           <SHLPNAME>SCTSOBJECT</SHLPNAME>
           <SHLPFIELD>OBJECT</SHLPFIELD>
          </DD27P>
          <DD27P>
           <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>
           <OBJPOS>0003</OBJPOS>
           <DDLANGUAGE>E</DDLANGUAGE>
           <VIEWFIELD>OBJ_NAME</VIEWFIELD>
           <TABNAME>TADIR</TABNAME>
           <FIELDNAME>OBJ_NAME</FIELDNAME>
           <KEYFLAG>X</KEYFLAG>
           <ROLLNAME>SOBJ_NAME</ROLLNAME>
           <ROLLNAMEVI>SOBJ_NAME</ROLLNAMEVI>
          </DD27P>
          <DD27P>
           <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>
           <OBJPOS>0004</OBJPOS>
           <DDLANGUAGE>E</DDLANGUAGE>
           <VIEWFIELD>KORRNUM</VIEWFIELD>
           <TABNAME>TADIR</TABNAME>
           <FIELDNAME>KORRNUM</FIELDNAME>
           <ROLLNAME>TRKORR_OLD</ROLLNAME>
           <ROLLNAMEVI>TRKORR_OLD</ROLLNAMEVI>
          </DD27P>
         </DD27P_TABLE>
        </asx:values>
       </asx:abap>
      </abapGit>`;


    const reg = new Registry().addFile(new MemoryFile("zag_unit_testv.view.xml", xml));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as View;
    expect(tabl.getName()).to.equal("ZAG_UNIT_TESTV");
    const structure = tabl.parseType(reg);
    expect(structure).to.be.instanceof(StructureType);
    const casted = structure as StructureType;
    expect(casted.getComponents().length).to.equal(4);
  });
});