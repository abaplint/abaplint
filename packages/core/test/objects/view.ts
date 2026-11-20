import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {View} from "../../src/objects";
import {StructureType} from "../../src/abap/types/basic/structure_type";
import {CharacterType, IntegerType, VoidType} from "../../src/abap/types/basic";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {getABAPObjects} from "../get_abap";
import {Position} from "../../src/position";

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
    const view = reg.getFirstObject()! as View;
    expect(view.getName()).to.equal("ZAG_UNIT_TESTV");
    const structure = view.parseType(reg);
    expect(structure).to.be.instanceof(StructureType);
    const casted = structure as StructureType;
    expect(casted.getComponents().length).to.equal(4);

    expect(view.listKeys().length).to.equal(3);
  });

  it("database view with 2 append views", async () => {
    const ztabl1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL1</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>tabl1</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>4</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTABL1</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000002</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000001</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD2</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000002</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000001</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD3</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000002</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000001</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const zview = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_VIEW" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>ZVIEW</VIEWNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>V</AGGTYPE>
    <ROOTTAB>ZTABL1</ROOTTAB>
    <DDTEXT>view</DDTEXT>
    <VIEWCLASS>D</VIEWCLASS>
    <VIEWGRANT>R</VIEWGRANT>
   </DD25V>
   <DD26V_TABLE>
    <DD26V>
     <VIEWNAME>ZVIEW</VIEWNAME>
     <TABNAME>ZTABL1</TABNAME>
     <TABPOS>0001</TABPOS>
     <FORTABNAME>ZTABL1</FORTABNAME>
    </DD26V>
   </DD26V_TABLE>
   <DD27P_TABLE>
    <DD27P>
     <VIEWFIELD>FIELD1</VIEWFIELD>
     <TABNAME>ZTABL1</TABNAME>
     <FIELDNAME>FIELD1</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
    </DD27P>
    <DD27P>
     <VIEWFIELD>MANDT</VIEWFIELD>
     <TABNAME>ZTABL1</TABNAME>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
    </DD27P>
    <DD27P>
     <VIEWFIELD>.APPEND</VIEWFIELD>
     <TABNAME>ZVIEW_APPEND1</TABNAME>
     <EFORM>*</EFORM>
    </DD27P>
    <DD27P>
     <VIEWFIELD>FIELD2</VIEWFIELD>
     <TABNAME>ZTABL1</TABNAME>
     <FIELDNAME>FIELD2</FIELDNAME>
     <EFORM>*</EFORM>
    </DD27P>
    <DD27P>
     <VIEWFIELD>.APPEND</VIEWFIELD>
     <TABNAME>ZVIEW_APPEND2</TABNAME>
     <EFORM>*</EFORM>
    </DD27P>
    <DD27P>
     <VIEWFIELD>FIELD3</VIEWFIELD>
     <TABNAME>ZTABL1</TABNAME>
     <FIELDNAME>FIELD3</FIELDNAME>
     <EFORM>*</EFORM>
    </DD27P>
   </DD27P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const zview_append1 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_VIEW" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>ZVIEW_APPEND1</VIEWNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>V</AGGTYPE>
    <ROOTTAB>ZVIEW</ROOTTAB>
    <DDTEXT>append1</DDTEXT>
    <VIEWCLASS>A</VIEWCLASS>
    <VIEWGRANT>R</VIEWGRANT>
   </DD25V>
   <DD26V_TABLE>
    <DD26V>
     <VIEWNAME>ZVIEW_APPEND1</VIEWNAME>
     <TABNAME>ZTABL1</TABNAME>
     <TABPOS>0001</TABPOS>
     <FORTABNAME>ZTABL1</FORTABNAME>
    </DD26V>
   </DD26V_TABLE>
   <DD27P_TABLE>
    <DD27P>
     <VIEWFIELD>FIELD2</VIEWFIELD>
     <TABNAME>ZTABL1</TABNAME>
     <FIELDNAME>FIELD2</FIELDNAME>
    </DD27P>
   </DD27P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const zview_append2 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_VIEW" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>ZVIEW_APPEND2</VIEWNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>V</AGGTYPE>
    <ROOTTAB>ZVIEW</ROOTTAB>
    <DDTEXT>append2</DDTEXT>
    <VIEWCLASS>A</VIEWCLASS>
    <VIEWGRANT>R</VIEWGRANT>
   </DD25V>
   <DD26V_TABLE>
    <DD26V>
     <VIEWNAME>ZVIEW_APPEND2</VIEWNAME>
     <TABNAME>ZTABL1</TABNAME>
     <TABPOS>0001</TABPOS>
     <FORTABNAME>ZTABL1</FORTABNAME>
    </DD26V>
   </DD26V_TABLE>
   <DD27P_TABLE>
    <DD27P>
     <VIEWFIELD>FIELD3</VIEWFIELD>
     <TABNAME>ZTABL1</TABNAME>
     <FIELDNAME>FIELD3</FIELDNAME>
    </DD27P>
   </DD27P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("ztabl1.tabl.xml", ztabl1),
      new MemoryFile("zview.view.xml", zview),
      new MemoryFile("zview_append1.view.xml", zview_append1),
      new MemoryFile("zview_append2.view.xml", zview_append2),
    ]);
    await reg.parseAsync();

    const view = reg.getFirstObject()! as View;
    const structure = view.parseType(reg);
    expect(structure).to.be.instanceof(StructureType);
    const casted = structure as StructureType;
    expect(casted.getComponents().length).to.equal(4);
  });

  it("parse join", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_VIEW" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>ZAG_UNIT_TEST_V</VIEWNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>V</AGGTYPE>
    <ROOTTAB>ZAG_UNIT_TEST_T1</ROOTTAB>
    <DDTEXT>Unit Test</DDTEXT>
    <VIEWCLASS>D</VIEWCLASS>
    <VIEWGRANT>R</VIEWGRANT>
   </DD25V>
   <DD26V_TABLE>
    <DD26V>
     <VIEWNAME>ZAG_UNIT_TEST_V</VIEWNAME>
     <TABNAME>ZAG_UNIT_TEST_T1</TABNAME>
     <TABPOS>0001</TABPOS>
     <FORTABNAME>ZAG_UNIT_TEST_T1</FORTABNAME>
    </DD26V>
    <DD26V>
     <VIEWNAME>ZAG_UNIT_TEST_V</VIEWNAME>
     <TABNAME>ZAG_UNIT_TEST_T2</TABNAME>
     <TABPOS>0002</TABPOS>
    </DD26V>
   </DD26V_TABLE>
   <DD27P_TABLE>
    <DD27P>
     <VIEWFIELD>MANDT</VIEWFIELD>
     <TABNAME>ZAG_UNIT_TEST_T1</TABNAME>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
    </DD27P>
    <DD27P>
     <VIEWFIELD>KEY_FIELD</VIEWFIELD>
     <TABNAME>ZAG_UNIT_TEST_T1</TABNAME>
     <FIELDNAME>KEY_FIELD</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
    </DD27P>
    <DD27P>
     <VIEWFIELD>DATA_FIELD</VIEWFIELD>
     <TABNAME>ZAG_UNIT_TEST_T1</TABNAME>
     <FIELDNAME>DATA_FIELD</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <CHECKTABLE>ZAG_UNIT_TEST_T2</CHECKTABLE>
     <SHLPORIGIN>P</SHLPORIGIN>
    </DD27P>
    <DD27P>
     <VIEWFIELD>DATA</VIEWFIELD>
     <TABNAME>ZAG_UNIT_TEST_T2</TABNAME>
     <FIELDNAME>DATA</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <SHLPORIGIN>F</SHLPORIGIN>
     <VALEXI>X</VALEXI>
    </DD27P>
   </DD27P_TABLE>
   <DD28J_TABLE>
    <DD28J>
     <VIEWNAME>ZAG_UNIT_TEST_V</VIEWNAME>
     <LTAB>ZAG_UNIT_TEST_T1</LTAB>
     <LFIELD>DATA_FIELD</LFIELD>
     <OPERATOR>EQ</OPERATOR>
     <RTAB>ZAG_UNIT_TEST_T2</RTAB>
     <RFIELD>KEY_FIELD</RFIELD>
     <SOURCE>S</SOURCE>
    </DD28J>
   </DD28J_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;


    const reg = new Registry().addFile(new MemoryFile("zag_unit_test_v.view.xml", xml));
    await reg.parseAsync();
    const view = reg.getFirstObject()! as View;
    expect(view).to.not.equal(undefined);
    expect(view.getJoin()?.length).to.equal(1);

  });

  const externalViewXML = (withTypes: boolean) => `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_VIEW" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD25V>
    <VIEWNAME>ZVEXT_PRIO</VIEWNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <DDLANGUAGE>E</DDLANGUAGE>
    <AGGTYPE>V</AGGTYPE>
    <ROOTTAB>ZVEXT_PRIO</ROOTTAB>
    <DDTEXT>external view</DDTEXT>
    <VIEWCLASS>X</VIEWCLASS>
   </DD25V>
   <DD27P_TABLE>
    <DD27P>
     <VIEWFIELD>ITEM</VIEWFIELD>
     <TABNAME>ZVEXT_PRIO</TABNAME>
     <FIELDNAME>ITEM</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <DBVIEWFIELD>ITEM</DBVIEWFIELD>${withTypes ? `
     <EXVDATATYPE>CHAR</EXVDATATYPE>
     <EXVFLENGTH>000018</EXVFLENGTH>` : ""}
    </DD27P>
    <DD27P>
     <VIEWFIELD>FLAG</VIEWFIELD>
     <TABNAME>ZVEXT_PRIO</TABNAME>
     <FIELDNAME>FLAG</FIELDNAME>
     <DBVIEWFIELD>FLAG</DBVIEWFIELD>${withTypes ? `
     <EXVDATATYPE>CHAR</EXVDATATYPE>
     <EXVFLENGTH>000001</EXVFLENGTH>` : ""}
    </DD27P>
    <DD27P>
     <VIEWFIELD>PRIO</VIEWFIELD>
     <TABNAME>ZVEXT_PRIO</TABNAME>
     <FIELDNAME>PRIO</FIELDNAME>
     <DBVIEWFIELD>PRIO</DBVIEWFIELD>${withTypes ? `
     <EXVDATATYPE>INT4</EXVDATATYPE>
     <EXVFLENGTH>000010</EXVFLENGTH>` : ""}
    </DD27P>
   </DD27P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("external view, types from EXVDATATYPE", async () => {
    const reg = new Registry().addFile(new MemoryFile("zvext_prio.view.xml", externalViewXML(true)));
    await reg.parseAsync();
    const view = reg.getFirstObject()! as View;
    const structure = view.parseType(reg);
    expect(structure).to.be.instanceof(StructureType);
    const components = (structure as StructureType).getComponents();
    expect(components.length).to.equal(3);

    expect(components[0].name).to.equal("ITEM");
    expect(components[0].type).to.be.instanceof(CharacterType);
    expect((components[0].type as CharacterType).getLength()).to.equal(18);

    expect(components[1].name).to.equal("FLAG");
    expect(components[1].type).to.be.instanceof(CharacterType);
    expect((components[1].type as CharacterType).getLength()).to.equal(1);

    expect(components[2].name).to.equal("PRIO");
    expect(components[2].type).to.be.instanceof(IntegerType);
  });

  it("external view, without EXVDATATYPE gives void", async () => {
    const reg = new Registry().addFile(new MemoryFile("zvext_prio.view.xml", externalViewXML(false)));
    await reg.parseAsync();
    const view = reg.getFirstObject()! as View;
    const structure = view.parseType(reg);
    expect(structure).to.be.instanceof(StructureType);
    const components = (structure as StructureType).getComponents();
    expect(components.length).to.equal(3);
    for (const c of components) {
      expect(c.type).to.be.instanceof(VoidType);
    }
  });

  it("external view, syntax", async () => {
    const abap = `DATA row TYPE zvext_prio.
row-item = 'A'.`;
    const reg = new Registry().addFiles([
      new MemoryFile("zvext_prio.view.xml", externalViewXML(true)),
      new MemoryFile("zvext_syntax.prog.abap", abap),
    ]);
    await reg.parseAsync();
    const prog = getABAPObjects(reg)[0];
    expect(prog.getType()).to.equal("PROG");
    const result = new SyntaxLogic(reg, prog).run();
    expect(result.issues.length).to.equal(0);

    const row = result.spaghetti.lookupPosition(new Position(2, 1), "zvext_syntax.prog.abap")?.findVariable("row");
    expect(row).to.not.equal(undefined);
    const rowType = row!.getType();
    expect(rowType).to.be.instanceof(StructureType);
    const item = (rowType as StructureType).getComponentByName("item");
    expect(item).to.be.instanceof(CharacterType);
    expect((item as CharacterType).getLength()).to.equal(18);
  });
});