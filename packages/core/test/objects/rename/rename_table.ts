import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";
import {dtelField, dtelXML, includeField, renameAll, tablXML, tagValues} from "./_ddic_xml";

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
    expect(reg.getObjectCount().normal).to.equal(1);
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
    expect(reg.getObjectCount().normal).to.equal(2);
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
    expect(reg.getObjectCount().normal).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("yecb_s_converter_fcat.tabl.xml");
      expect(f.getRaw()).to.include("<FORTABLE>YECB_S_CONVERTER_FCAT</FORTABLE>");
    }
  });

  it("TABL, .INCLUDE and .INCLU- of the renamed structure", () => {
    const result = renameAll([
      ["inc.tabl.xml", tablXML("inc", [dtelField("F", "CHAR10_X")])],
      ["char10_x.dtel.xml", dtelXML("char10_x")],
      ["outer.tabl.xml", tablXML("outer", [includeField("INC"), includeField("INC", ".INCLU-_X")])],
    ], [["TABL", "inc", "zinc"]]);
    expect(Object.keys(result).sort()).to.deep.equal(["char10_x.dtel.xml", "outer.tabl.xml", "zinc.tabl.xml"]);
    expect(tagValues(result["outer.tabl.xml"], "PRECFIELD")).to.deep.equal(["ZINC", "ZINC"]);
  });

  it("TABL, used as check table", () => {
    const foreignKey = `
   <DD05M_TABLE>
    <DD05M>
     <FIELDNAME>KEY</FIELDNAME>
     <FORTABLE>USER</FORTABLE>
     <FORKEY>KEY</FORKEY>
     <CHECKTABLE>CHK</CHECKTABLE>
     <CHECKFIELD>KEY</CHECKFIELD>
     <PRIMPOS>0001</PRIMPOS>
    </DD05M>
   </DD05M_TABLE>
   <DD08V_TABLE>
    <DD08V>
     <FIELDNAME>KEY</FIELDNAME>
     <CHECKTABLE>CHK</CHECKTABLE>
    </DD08V>
   </DD08V_TABLE>`;
    const result = renameAll([
      ["mydtel.dtel.xml", dtelXML("mydtel")],
      ["chk.tabl.xml", tablXML("chk", [dtelField("KEY", "MYDTEL", "<KEYFLAG>X</KEYFLAG>")], "TRANSP")],
      ["user.tabl.xml", tablXML("user", [dtelField("KEY", "MYDTEL", "<CHECKTABLE>CHK</CHECKTABLE>")], "INTTAB", foreignKey)],
    ], [["TABL", "chk", "zchk"]]);
    expect(Object.keys(result).sort()).to.deep.equal(["mydtel.dtel.xml", "user.tabl.xml", "zchk.tabl.xml"]);
    expect(tagValues(result["user.tabl.xml"], "CHECKTABLE")).to.deep.equal(["ZCHK", "ZCHK", "ZCHK"]);
    expect(tagValues(result["user.tabl.xml"], "FORTABLE")).to.deep.equal(["USER"]);
  });

  it("TABL, its own check table", () => {
    const result = renameAll([
      ["mydtel.dtel.xml", dtelXML("mydtel")],
      ["chk.tabl.xml", tablXML("chk", [
        dtelField("KEY", "MYDTEL", "<KEYFLAG>X</KEYFLAG>"),
        dtelField("PARENT", "MYDTEL", "<CHECKTABLE>CHK</CHECKTABLE>")], "TRANSP")],
    ], [["TABL", "chk", "zchk"]]);
    expect(tagValues(result["zchk.tabl.xml"], "CHECKTABLE")).to.deep.equal(["ZCHK"]);
  });

  it("TABL, renaming tables first keeps the where-used of data elements in an including structure", () => {
    const files: [string, string][] = [
      ["mydtel.dtel.xml", dtelXML("mydtel")],
      ["otherdtel.dtel.xml", dtelXML("otherdtel")],
      ["inc.tabl.xml", tablXML("inc", [dtelField("F", "MYDTEL")])],
      ["outer.tabl.xml", tablXML("outer", [includeField("INC"), dtelField("G", "OTHERDTEL")])],
      ["side.tabl.xml", tablXML("side", [dtelField("H", "MYDTEL")])],
    ];
    const result = renameAll(files, [
      ["TABL", "inc", "zinc"],
      ["TABL", "outer", "zouter"],
      ["TABL", "side", "zside"],
      ["DTEL", "mydtel", "zmydtel"],
      ["DTEL", "otherdtel", "zotherdtel"],
    ]);
    expect(Object.keys(result).sort()).to.deep.equal(
      ["zinc.tabl.xml", "zmydtel.dtel.xml", "zotherdtel.dtel.xml", "zouter.tabl.xml", "zside.tabl.xml"]);
    expect(tagValues(result["zouter.tabl.xml"], "PRECFIELD")).to.deep.equal(["ZINC"]);
    expect(tagValues(result["zouter.tabl.xml"], "ROLLNAME")).to.deep.equal(["ZOTHERDTEL"]);
    expect(tagValues(result["zinc.tabl.xml"], "ROLLNAME")).to.deep.equal(["ZMYDTEL"]);
    expect(tagValues(result["zside.tabl.xml"], "ROLLNAME")).to.deep.equal(["ZMYDTEL"]);
  });

});
