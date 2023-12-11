import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename TABL", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>testing</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>
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
     <FIELDNAME>XUBNAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>NAME</FIELDNAME>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

  const foreign = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZEXCEL_S_CONVERTER_FCAT</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>Field catalog for converter</DDTEXT>
    <EXCLASS>4</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>TABNAME</FIELDNAME>
     <ROLLNAME>TABNAME</ROLLNAME>
     <CHECKTABLE>DD02L</CHECKTABLE>
     <ADMINFIELD>0</ADMINFIELD>
     <SHLPORIGIN>P</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELDNAME</FIELDNAME>
     <ROLLNAME>ZEXCEL_FIELDNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>COLUMNNAME</FIELDNAME>
     <ROLLNAME>ZEXCEL_FIELDNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>POSITION</FIELDNAME>
     <ROLLNAME>TABFDPOS</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>INTTYPE</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000002</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000001</LENG>
     <MASK>  CHAR</MASK>
     <DDTEXT>ABAP data type (C,D,N,...)</DDTEXT>
    </DD03P>
    <DD03P>
     <FIELDNAME>DECIMALS</FIELDNAME>
     <ROLLNAME>INT1</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>SCRTEXT_S</FIELDNAME>
     <ROLLNAME>SCRTEXT_S</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>SCRTEXT_M</FIELDNAME>
     <ROLLNAME>SCRTEXT_M</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>SCRTEXT_L</FIELDNAME>
     <ROLLNAME>SCRTEXT_L</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>TOTALS_FUNCTION</FIELDNAME>
     <ROLLNAME>ZEXCEL_TABLE_TOTALS_FUNCTION</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIX_COLUMN</FIELDNAME>
     <ROLLNAME>FLAG</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>ALIGNMENT</FIELDNAME>
     <ROLLNAME>ZEXCEL_ALIGNMENT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>IS_OPTIMIZED</FIELDNAME>
     <ROLLNAME>FLAG</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>IS_HIDDEN</FIELDNAME>
     <ROLLNAME>FLAG</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>IS_COLLAPSED</FIELDNAME>
     <ROLLNAME>FLAG</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>IS_SUBTOTALLED</FIELDNAME>
     <ROLLNAME>FLAG</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <VALEXI>X</VALEXI>
     <SHLPORIGIN>F</SHLPORIGIN>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>SORT_LEVEL</FIELDNAME>
     <ROLLNAME>INT4</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>STYLE_HDR</FIELDNAME>
     <ROLLNAME>ZEXCEL_CELL_STYLE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>STYLE_NORMAL</FIELDNAME>
     <ROLLNAME>ZEXCEL_CELL_STYLE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>STYLE_STRIPPED</FIELDNAME>
     <ROLLNAME>ZEXCEL_CELL_STYLE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>STYLE_TOTAL</FIELDNAME>
     <ROLLNAME>ZEXCEL_CELL_STYLE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>STYLE_SUBTOTAL</FIELDNAME>
     <ROLLNAME>ZEXCEL_CELL_STYLE</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>COL_ID</FIELDNAME>
     <ROLLNAME>LVC_COLID</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>CONVEXIT</FIELDNAME>
     <ROLLNAME>CONVEXIT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
   <DD05M_TABLE>
    <DD05M>
     <FIELDNAME>TABNAME</FIELDNAME>
     <FORTABLE>ZEXCEL_S_CONVERTER_FCAT</FORTABLE>
     <FORKEY>TABNAME</FORKEY>
     <CHECKTABLE>DD02L</CHECKTABLE>
     <CHECKFIELD>TABNAME</CHECKFIELD>
     <PRIMPOS>0001</PRIMPOS>
     <DOMNAME>AS4TAB</DOMNAME>
     <DATATYPE>CHAR</DATATYPE>
    </DD05M>
    <DD05M>
     <FIELDNAME>TABNAME</FIELDNAME>
     <FORTABLE>&apos;A&apos;</FORTABLE>
     <CHECKTABLE>DD02L</CHECKTABLE>
     <CHECKFIELD>AS4LOCAL</CHECKFIELD>
     <PRIMPOS>0002</PRIMPOS>
     <DOMNAME>AS4LOCAL</DOMNAME>
     <DATATYPE>CHAR</DATATYPE>
    </DD05M>
    <DD05M>
     <FIELDNAME>TABNAME</FIELDNAME>
     <FORTABLE>&apos;0000&apos;</FORTABLE>
     <CHECKTABLE>DD02L</CHECKTABLE>
     <CHECKFIELD>AS4VERS</CHECKFIELD>
     <PRIMPOS>0003</PRIMPOS>
     <DOMNAME>AS4VERS</DOMNAME>
     <DATATYPE>NUMC</DATATYPE>
    </DD05M>
   </DD05M_TABLE>
   <DD08V_TABLE>
    <DD08V>
     <FIELDNAME>TABNAME</FIELDNAME>
     <CHECKTABLE>DD02L</CHECKTABLE>
    </DD08V>
   </DD08V_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("TABL, no references, just the object", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zabapgit_unit_t2.tabl.xml", xml),
    ]).parse();
    new Renamer(reg).rename("TABL", "zabapgit_unit_t2", "foo");
    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.tabl.xml");
      expect(f.getRaw().includes("<TABNAME>FOO</TABNAME>")).to.equal(true);
    }
  });

  it("TABL, referenced via dash", () => {
    const prog = `REPORT zprog_rename_tabl.
DATA bar2 TYPE zabapgit_unit_t2-name.`;
    const reg = new Registry().addFiles([
      new MemoryFile("zabapgit_unit_t2.tabl.xml", xml),
      new MemoryFile("zprog_rename_tabl.prog.abap", prog),
    ]).parse();
    reg.findIssues(); // hmm, this builds the ddic references
    new Renamer(reg).rename("TABL", "zabapgit_unit_t2", "foo");
    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.tabl.xml") {
        expect(f.getFilename()).to.equal("foo.tabl.xml");
        expect(f.getRaw().includes("<TABNAME>FOO</TABNAME>")).to.equal(true);
      } else if (f.getFilename() === "zprog_rename_tabl.prog.abap") {
        expect(f.getRaw()).to.equal(`REPORT zprog_rename_tabl.
DATA bar2 TYPE foo-name.`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

  it("TABL, foreign key", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zexcel_s_converter_fcat.tabl.xml", foreign),
    ]).parse();
    new Renamer(reg).rename("TABL", "ZEXCEL_S_CONVERTER_FCAT", "YECB_S_CONVERTER_FCAT");
    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("yecb_s_converter_fcat.tabl.xml");
      expect(f.getRaw()).to.include("<FORTABLE>YECB_S_CONVERTER_FCAT</FORTABLE>");
    }
  });

});