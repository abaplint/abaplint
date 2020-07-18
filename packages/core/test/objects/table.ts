import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Table, EnhancementCategory, TableCategory} from "../../src/objects";
import {StructureType, TableType, ObjectReferenceType, UnknownType, VoidType} from "../../src/abap/types/basic";

describe("Table, parse XML", () => {
  const xml1 =
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
    "     <FIELDNAME>DATA_RAW</FIELDNAME>\n" +
    "     <DDLANGUAGE>E</DDLANGUAGE>\n" +
    "     <POSITION>0003</POSITION>\n" +
    "     <ADMINFIELD>0</ADMINFIELD>\n" +
    "     <INTTYPE>y</INTTYPE>\n" +
    "     <INTLEN>000008</INTLEN>\n" +
    "     <DATATYPE>RSTR</DATATYPE>\n" +
    "     <MASK>  RSTR</MASK>\n" +
    "    </DD03P>    \n" +
    "    <DD03P>\n" +
    "     <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>\n" +
    "     <FIELDNAME>NAME</FIELDNAME>\n" +
    "     <POSITION>0004</POSITION>\n" +
    "     <ROLLNAME>XUBNAME</ROLLNAME>\n" +
    "     <ADMINFIELD>0</ADMINFIELD>\n" +
    "     <COMPTYPE>E</COMPTYPE>\n" +
    "    </DD03P>\n" +
    "   </DD03P_TABLE>\n" +
    "  </asx:values>\n" +
    " </asx:abap>\n" +
    "</abapGit>";

  it("test 1, fields, category, enhancement category", async () => {
    const reg = new Registry().addFile(new MemoryFile("zabapgit_unit_t2.tabl.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    expect(tabl.getName()).to.equal("ZABAPGIT_UNIT_T2");

    const fields = tabl.parseType(reg);
    if (fields instanceof UnknownType || fields instanceof VoidType) {
      expect.fail();
    }
    expect(fields.getComponents().length).to.equal(4);
    expect(tabl.getTableCategory()).to.equal(TableCategory.Transparent);
    expect(tabl.getEnhancementCategory()).to.equal(EnhancementCategory.CannotBeEhanced);
  });

  it("test 2, empty enhancement category", async () => {
    const xml =
      "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_TABL\" serializer_version=\"v1.0.0\">\n" +
      " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "  <asx:values>\n" +
      "   <DD02V>\n" +
      "    <TABNAME>ZSYST</TABNAME>\n" +
      "    <DDLANGUAGE>E</DDLANGUAGE>\n" +
      "    <TABCLASS>INTTAB</TABCLASS>\n" +
      "    <DDTEXT>Fields</DDTEXT>\n" +
      "    <APPLCLASS>SAB4</APPLCLASS>\n" +
      "    <AUTHCLASS>02</AUTHCLASS>\n" +
      "    <MASTERLANG>D</MASTERLANG>\n" +
      "   </DD02V>\n" +
      "  </asx:values>\n" +
      " </asx:abap>\n" +
      "</abapGit>";

    const reg = new Registry().addFile(new MemoryFile("zsyst.tabl.xml", xml));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    expect(tabl.getEnhancementCategory()).to.equal(EnhancementCategory.NotClassified);
  });

  it("Call parseType", async () => {
    const reg = new Registry().addFile(new MemoryFile("zabapgit_unit_t2.tabl.xml", xml1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    const stru = type as StructureType;
    expect(stru.getComponents().length).to.equal(4);
  });

  it("Nested structure", async () => {
    const structure1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZSTRUCTURE1</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>structure 1</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>ZSTRUCTURE1</TABNAME>
     <FIELDNAME>FIELD</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>g</INTTYPE>
     <INTLEN>000008</INTLEN>
     <DATATYPE>STRG</DATATYPE>
     <MASK>  STRG</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const structure2 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZSTRUCTURE2</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>Structure 1</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>ZSTRUCTURE2</TABNAME>
     <FIELDNAME>MOO</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>g</INTTYPE>
     <INTLEN>000008</INTLEN>
     <DATATYPE>STRG</DATATYPE>
     <MASK>  STRG</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>ZSTRUCTURE2</TABNAME>
     <FIELDNAME>HELLO</FIELDNAME>
     <POSITION>0002</POSITION>
     <ROLLNAME>ZSTRUCTURE1</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <DATATYPE>STRU</DATATYPE>
     <MASK>  STRUS</MASK>
     <COMPTYPE>S</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry();
    reg.addFile(new MemoryFile("zstructure2.tabl.xml", structure2));
    reg.addFile(new MemoryFile("zstructure1.tabl.xml", structure1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    const stru = type as StructureType;
    const components = stru.getComponents();
    expect(components.length).to.equal(2);
    expect(components[1].name).to.equal("HELLO");
    expect(components[1].type).to.be.instanceof(StructureType);
  });

  it("Structure with table type", async () => {
    const structure1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZSTRUCTURE1</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>structure 1</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>ZSTRUCTURE1</TABNAME>
     <FIELDNAME>NESTED</FIELDNAME>
     <POSITION>0001</POSITION>
     <ROLLNAME>ZTABLE_TYPE_TEST_AG</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <DATATYPE>TTYP</DATATYPE>
     <MASK>  TTYPL</MASK>
     <COMPTYPE>L</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const ttyp = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTABLE_TYPE_TEST_AG</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>STRG</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>foobar</DDTEXT>
    <TYPELEN>000008</TYPELEN>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry();
    reg.addFile(new MemoryFile("zstructure1.tabl.xml", structure1));
    reg.addFile(new MemoryFile("ztable_type_test_ag.ttyp.xml", ttyp));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    const stru = type as StructureType;
    const components = stru.getComponents();
    expect(components.length).to.equal(1);
    expect(components[0].name).to.equal("NESTED");
    expect(components[0].type).to.be.instanceof(TableType);
  });


  it("TABL, object reference", async () => {
    const structure1 = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZSTRUCTURE1</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>structure 1</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>ZSTRUCTURE1</TABNAME>
     <FIELDNAME>SERVER</FIELDNAME>
     <POSITION>0001</POSITION>
     <ROLLNAME>IF_HTTP_SERVER</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <DATATYPE>REF</DATATYPE>
     <MASK>  REF RI</MASK>
     <COMPTYPE>R</COMPTYPE>
     <REFTYPE>I</REFTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zstructure1.tabl.xml", structure1));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(StructureType);
    const stru = type as StructureType;
    const components = stru.getComponents();
    expect(components.length).to.equal(1);
    expect(components[0].type).to.be.instanceof(ObjectReferenceType);
  });

  it("TABL, parseType, .INCLUDE void", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <DD02V>
      <TABNAME>ZLIST_ALV</TABNAME>
      <DDLANGUAGE>E</DDLANGUAGE>
      <TABCLASS>INTTAB</TABCLASS>
      <LANGDEP>X</LANGDEP>
      <DDTEXT>sdfsdf</DDTEXT>
      <EXCLASS>1</EXCLASS>
     </DD02V>
     <DD03P_TABLE>
      <DD03P>
       <TABNAME>ZLIST_ALV</TABNAME>
       <FIELDNAME>.INCLUDE</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0001</POSITION>
       <ADMINFIELD>0</ADMINFIELD>
       <PRECFIELD>BDCP2</PRECFIELD>
       <MASK>      S</MASK>
       <DDTEXT>sdfsdf</DDTEXT>
       <COMPTYPE>S</COMPTYPE>
      </DD03P>
      <DD03P>
       <TABNAME>ZLIST_ALV</TABNAME>
       <FIELDNAME>CRE_DATE</FIELDNAME>
       <DDLANGUAGE>E</DDLANGUAGE>
       <POSITION>0016</POSITION>
       <ADMINFIELD>0</ADMINFIELD>
       <INTTYPE>D</INTTYPE>
       <INTLEN>000016</INTLEN>
       <DATATYPE>DATS</DATATYPE>
       <LENG>000008</LENG>
       <MASK>  DATS</MASK>
       <DDTEXT>Creation date</DDTEXT>
       <SHLPORIGIN>T</SHLPORIGIN>
      </DD03P>
     </DD03P_TABLE>
    </asx:values>
   </asx:abap>
  </abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zlist_alv.tabl.xml", xml));
    await reg.parseAsync();
    const tabl = reg.getFirstObject()! as Table;

    const type = tabl.parseType(reg);
    expect(type).to.be.instanceof(VoidType);
  });

});