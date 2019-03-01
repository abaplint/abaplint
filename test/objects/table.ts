import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Table, EnhancementCategory, TableCategory} from "../../src/objects";

describe("Table, parse XML", () => {
  it("test", () => {
    const xml =
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_TABL\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <DD02V>\n" +
      "    <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>\n" +
      "    <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "    <TABCLASS>TRANSP</TABCLASS>\n" +
      "    <CLIDEP>X</CLIDEP>\n" +
      "    <DDTEXT>testing</DDTEXT>\n" +
      "    <CONTFLAG>A</CONTFLAG>\n" +
      "    <EXCLASS>1</EXCLASS>\n" +
      "   </DD02V>\n" +
      "   <DD09L>\n" +
      "    <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>\n" +
      "    <AS4LOCAL>A</AS4LOCAL>\n" +
      "    <TABKAT>0</TABKAT>\n" +
      "    <TABART>APPL0</TABART>\n" +
      "    <BUFALLOW>N</BUFALLOW>\n" +
      "   </DD09L>\n" +
      "   <DD03P_TABLE>\n" +
      "    <DD03P>\n" +
      "     <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>\n" +
      "     <FIELDNAME>MANDT</FIELDNAME>\n" +
      "     <POSITION>0001</POSITION>\n" +
      "     <KEYFLAG>X</KEYFLAG>\n" +
      "     <ROLLNAME>MANDT</ROLLNAME>\n" +
      "     <ADMINFIELD>0</ADMINFIELD>\n" +
      "     <NOTNULL>X</NOTNULL>\n" +
      "     <COMPTYPE>E</COMPTYPE>\n" +
      "    </DD03P>\n" +
      "    <DD03P>\n" +
      "     <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>\n" +
      "     <FIELDNAME>XUBNAME</FIELDNAME>\n" +
      "     <POSITION>0002</POSITION>\n" +
      "     <KEYFLAG>X</KEYFLAG>\n" +
      "     <ROLLNAME>XUBNAME</ROLLNAME>\n" +
      "     <ADMINFIELD>0</ADMINFIELD>\n" +
      "     <NOTNULL>X</NOTNULL>\n" +
      "     <COMPTYPE>E</COMPTYPE>\n" +
      "    </DD03P>\n" +
      "    <DD03P>\n" +
      "     <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>\n" +
      "     <FIELDNAME>NAME</FIELDNAME>\n" +
      "     <POSITION>0003</POSITION>\n" +
      "     <ROLLNAME>XUBNAME</ROLLNAME>\n" +
      "     <ADMINFIELD>0</ADMINFIELD>\n" +
      "     <COMPTYPE>E</COMPTYPE>\n" +
      "    </DD03P>\n" +
      "   </DD03P_TABLE>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";

    const reg = new Registry().addFile(new MemoryFile("zabapgit_unit_t2.tabl.xml", xml)).parse();
    const tabl = reg.getObjects()[0] as Table;

    expect(tabl.getName()).to.equal("ZABAPGIT_UNIT_T2");

    const fields = tabl.getFields();
    expect(fields.length).to.equal(3);
    expect(fields).to.contain("MANDT");
    expect(fields).to.contain("XUBNAME");
    expect(fields).to.contain("NAME");

    expect(tabl.getTableCategory()).to.equal("TRANSP");
    expect(tabl.getTableCategory()).to.equal(TableCategory.Transparent);

    expect(tabl.getEnhancementCategory()).to.equal("1");
    expect(tabl.getEnhancementCategory()).to.equal(EnhancementCategory.CannotBeEhanced);
  });
});