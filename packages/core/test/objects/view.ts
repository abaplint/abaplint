import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {View} from "../../src/objects";

describe("View, parse XML", () => {
  it("test", async () => {
    const xml =
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_VIEW\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <DD25V>\n" +
      "    <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>\n" +
      "    <AS4LOCAL>A</AS4LOCAL>\n" +
      "    <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "    <AGGTYPE>V</AGGTYPE>\n" +
      "    <ROOTTAB>TADIR</ROOTTAB>\n" +
      "    <DDTEXT>unit test</DDTEXT>\n" +
      "    <VIEWCLASS>D</VIEWCLASS>\n" +
      "    <VIEWGRANT>R</VIEWGRANT>\n" +
      "   </DD25V>\n" +
      "   <DD26V_TABLE>\n" +
      "    <DD26V>\n" +
      "     <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>\n" +
      "     <TABNAME>TADIR</TABNAME>\n" +
      "     <TABPOS>0001</TABPOS>\n" +
      "     <FORTABNAME>TADIR</FORTABNAME>\n" +
      "    </DD26V>\n" +
      "   </DD26V_TABLE>\n" +
      "   <DD27P_TABLE>\n" +
      "    <DD27P>\n" +
      "     <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>\n" +
      "     <OBJPOS>0001</OBJPOS>\n" +
      "     <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "     <VIEWFIELD>PGMID</VIEWFIELD>\n" +
      "     <TABNAME>TADIR</TABNAME>\n" +
      "     <FIELDNAME>PGMID</FIELDNAME>\n" +
      "     <KEYFLAG>X</KEYFLAG>\n" +
      "     <ROLLNAME>PGMID</ROLLNAME>\n" +
      "     <ROLLNAMEVI>PGMID</ROLLNAMEVI>\n" +
      "    </DD27P>\n" +
      "    <DD27P>\n" +
      "     <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>\n" +
      "     <OBJPOS>0002</OBJPOS>\n" +
      "     <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "     <VIEWFIELD>OBJECT</VIEWFIELD>\n" +
      "     <TABNAME>TADIR</TABNAME>\n" +
      "     <FIELDNAME>OBJECT</FIELDNAME>\n" +
      "     <KEYFLAG>X</KEYFLAG>\n" +
      "     <ROLLNAME>TROBJTYPE</ROLLNAME>\n" +
      "     <ROLLNAMEVI>TROBJTYPE</ROLLNAMEVI>\n" +
      "     <SHLPORIGIN>X</SHLPORIGIN>\n" +
      "     <SHLPNAME>SCTSOBJECT</SHLPNAME>\n" +
      "     <SHLPFIELD>OBJECT</SHLPFIELD>\n" +
      "    </DD27P>\n" +
      "    <DD27P>\n" +
      "     <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>\n" +
      "     <OBJPOS>0003</OBJPOS>\n" +
      "     <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "     <VIEWFIELD>OBJ_NAME</VIEWFIELD>\n" +
      "     <TABNAME>TADIR</TABNAME>\n" +
      "     <FIELDNAME>OBJ_NAME</FIELDNAME>\n" +
      "     <KEYFLAG>X</KEYFLAG>\n" +
      "     <ROLLNAME>SOBJ_NAME</ROLLNAME>\n" +
      "     <ROLLNAMEVI>SOBJ_NAME</ROLLNAMEVI>\n" +
      "    </DD27P>\n" +
      "    <DD27P>\n" +
      "     <VIEWNAME>ZAG_UNIT_TESTV</VIEWNAME>\n" +
      "     <OBJPOS>0004</OBJPOS>\n" +
      "     <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "     <VIEWFIELD>KORRNUM</VIEWFIELD>\n" +
      "     <TABNAME>TADIR</TABNAME>\n" +
      "     <FIELDNAME>KORRNUM</FIELDNAME>\n" +
      "     <ROLLNAME>TRKORR_OLD</ROLLNAME>\n" +
      "     <ROLLNAMEVI>TRKORR_OLD</ROLLNAMEVI>\n" +
      "    </DD27P>\n" +
      "   </DD27P_TABLE>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";


    const reg = new Registry().addFile(new MemoryFile("zag_unit_testv.view.xml", xml));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as View;
    expect(tabl.getName()).to.equal("ZAG_UNIT_TESTV");
    const fields = tabl.getFields();
    expect(fields.length).to.equal(4);
    expect(fields).to.contain("PGMID");
    expect(fields).to.contain("OBJECT");
    expect(fields).to.contain("OBJ_NAME");
    expect(fields).to.contain("KORRNUM");
  });
});