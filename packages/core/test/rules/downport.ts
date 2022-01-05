import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Downport} from "../../src/rules";
import {Config} from "../../src/config";
import {testRuleFixSingle} from "./_utils";
import {IConfiguration} from "../../src/_config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";
import {IFile} from "../../src/files/_ifile";

function buildConfig(): IConfiguration {
  const conf = Config.getDefault().get();
  conf.syntax.version = Version.v702;
  const conf702 = new Config(JSON.stringify(conf));
  return conf702;
}

function testFix(input: string, expected: string, extraFiles?: IFile[]) {
  testRuleFixSingle(input, expected, new Downport(), buildConfig(), extraFiles, false);
}

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry(buildConfig()).addFile(new MemoryFile("zdownport.prog.abap", abap));
  await reg.parseAsync();
  const rule = new Downport();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: downport", () => {

  it("parser error", async () => {
    const issues = await findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("all okay, pass along", async () => {
    const issues = await findIssues("WRITE bar.");
    expect(issues.length).to.equal(0);
  });

// todo, this example can actually be implemented?
  it("try downport voided value", async () => {
    const issues = await findIssues("DATA(bar) = VALUE asdf( ).");
    expect(issues.length).to.equal(1);
  });

// todo, this example can actually be implemented?
  it("try downport unknown type", async () => {
    const issues = await findIssues("DATA(bar) = VALUE zfoobar( ).");
    expect(issues.length).to.equal(1);
  });

  it("try downport unknown type, 2", async () => {
    const issues = await findIssues(`
    TYPES ty_bar TYPE STANDARD TABLE OF zfoobar WITH DEFAULT KEY.
    DATA(bar) = VALUE ty_bar( ).`);
    expect(issues.length).to.equal(1);
  });

  it("downport voided LOOP fs", async () => {
    const abap = `FROM bar.
  DATA lt_rows TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
  LOOP AT lt_rows ASSIGNING FIELD-SYMBOL(<lv_row>).
  ENDLOOP.
ENDFORM.`;

    const expected = `FROM bar.
  DATA lt_rows TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
  FIELD-SYMBOLS <lv_row> LIKE LINE OF lt_rows.
  LOOP AT lt_rows ASSIGNING <lv_row>.
  ENDLOOP.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("downport voided LOOP data", async () => {
    const abap = `FROM bar.
  DATA lt_rows TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
  LOOP AT lt_rows INTO DATA(moo).
  ENDLOOP.
ENDFORM.`;

    const expected = `FROM bar.
  DATA lt_rows TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
  DATA moo LIKE LINE OF lt_rows.
  LOOP AT lt_rows INTO moo.
  ENDLOOP.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("Use CREATE OBJECT instead of NEW", async () => {
    const issues = await findIssues("foo = NEW #( ).");
    expect(issues.length).to.equal(1);
  });

  it("quick fix, Use CREATE OBJECT instead of NEW", async () => {
    const abap = "foo = NEW #( ).";
    const expected = "CREATE OBJECT foo.";
    testFix(abap, expected);
  });

  it("quick fix, Use CREATE OBJECT instead of NEW, lower case", async () => {
    const abap = "foo = new #( ).";
    const expected = "CREATE OBJECT foo.";
    testFix(abap, expected);
  });

  it("test position of quick fix is second line", async () => {
    const abap = "DATA foo TYPE REF TO object.\nfoo = NEW #( ).";
    const expected = "DATA foo TYPE REF TO object.\nCREATE OBJECT foo.";
    testFix(abap, expected);
  });

  it("quick fix, with TYPE", async () => {
    const abap = "foo = NEW zcl_bar( ).";
    const expected = "CREATE OBJECT foo TYPE zcl_bar.";
    testFix(abap, expected);
  });

  it("with a parameter", async () => {
    testFix("foo = NEW #( foo = bar ).", "CREATE OBJECT foo EXPORTING foo = bar.");
  });

  it("Not top level source NEW", async () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS m RETURNING VALUE(val) TYPE string.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD m.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA temp1 TYPE string.
  temp1 = to_lower( NEW lcl_bar( )->m( ) ).
ENDFORM.`;

    const expected = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS m RETURNING VALUE(val) TYPE string.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD m.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA temp1 TYPE string.
  DATA temp2 TYPE REF TO lcl_bar.
  CREATE OBJECT temp2 TYPE lcl_bar.
  temp1 = to_lower( temp2->m( ) ).
ENDFORM.`;

    testFix(abap, expected);
  });

  it("Outline DATA i definition", async () => {
    const abap = "DATA(foo) = 2.";
    const expected = "DATA foo TYPE i.\nfoo = 2.";
    testFix(abap, expected);
  });

  it("Outline DATA string definition", async () => {
    const abap = "DATA(foo) = |sdfdsfds|.";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("Outline DATA and NEW, apply outline first", async () => {
    const abap = `
    CLASS lcl_class DEFINITION.
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.
    DATA(lo_text) = NEW lcl_class( ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("Outline");
  });

  it("NEW, with default parameter to constructor", async () => {
    const abap = `
CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING str TYPE string.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA lo_text TYPE REF TO lcl_class.
  lo_text = NEW lcl_class( 'bar' ).
ENDFORM.`;

    const expected = `
CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING str TYPE string.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA lo_text TYPE REF TO lcl_class.
  CREATE OBJECT lo_text TYPE lcl_class EXPORTING STR = 'bar'.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("NEW, inferred type with default parameter", async () => {
    const abap = `
CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING str TYPE string.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA lo_text TYPE REF TO lcl_class.
  lo_text = NEW #( 'bar' ).
ENDFORM.`;

    const expected = `
CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING str TYPE string.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA lo_text TYPE REF TO lcl_class.
  CREATE OBJECT lo_text EXPORTING STR = 'bar'.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("outline, returning table, global type definition", async () => {
    const abap = `
    TYPES tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.

    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        CLASS-METHODS m RETURNING VALUE(val) TYPE tab.
    ENDCLASS.

    CLASS lcl_class IMPLEMENTATION.
      METHOD m.
      ENDMETHOD.
    ENDCLASS.

    FORM bar.
      DATA(bar) = lcl_class=>m( ).
    ENDFORM.`;

    const expected = `
    TYPES tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.

    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        CLASS-METHODS m RETURNING VALUE(val) TYPE tab.
    ENDCLASS.

    CLASS lcl_class IMPLEMENTATION.
      METHOD m.
      ENDMETHOD.
    ENDCLASS.

    FORM bar.
      DATA bar TYPE tab.
      bar = lcl_class=>m( ).
    ENDFORM.`;

    testFix(abap, expected);
  });

  it("outline, returning table, type part of class definition", async () => {
    const abap = `
    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        TYPES tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
        CLASS-METHODS m RETURNING VALUE(val) TYPE tab.
    ENDCLASS.

    CLASS lcl_class IMPLEMENTATION.
      METHOD m.
      ENDMETHOD.
    ENDCLASS.

    FORM bar.
      DATA(bar) = lcl_class=>m( ).
    ENDFORM.`;

    const expected = `
    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        TYPES tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
        CLASS-METHODS m RETURNING VALUE(val) TYPE tab.
    ENDCLASS.

    CLASS lcl_class IMPLEMENTATION.
      METHOD m.
      ENDMETHOD.
    ENDCLASS.

    FORM bar.
      DATA bar TYPE lcl_class=>tab.
      bar = lcl_class=>m( ).
    ENDFORM.`;

    testFix(abap, expected);
  });

  it("outline, returning object reference", async () => {
    const abap = `
    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        CLASS-METHODS m RETURNING VALUE(val) TYPE REF TO lcl_class.
    ENDCLASS.

    CLASS lcl_class IMPLEMENTATION.
      METHOD m.
      ENDMETHOD.
    ENDCLASS.

    FORM bar.
      DATA(foobar) = lcl_class=>m( ).
    ENDFORM.`;

    const expected = `
    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        CLASS-METHODS m RETURNING VALUE(val) TYPE REF TO lcl_class.
    ENDCLASS.

    CLASS lcl_class IMPLEMENTATION.
      METHOD m.
      ENDMETHOD.
    ENDCLASS.

    FORM bar.
      DATA foobar TYPE REF TO lcl_class.
      foobar = lcl_class=>m( ).
    ENDFORM.`;

    testFix(abap, expected);
  });

  it("outline, READ TABLE INTO", async () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    APPEND 2 TO tab.
    READ TABLE tab INDEX 1 INTO DATA(row).`;

    const expected = `
    DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    APPEND 2 TO tab.
    DATA row TYPE i.
    READ TABLE tab INDEX 1 INTO row.`;

    testFix(abap, expected);
  });

  it("EMPTY KEY quick fix", async () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.`;
    const expected = `DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.`;
    testFix(abap, expected);
  });

  it("EMPTY KEY quick fix, lower case", async () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF i WITH empty key.`;
    const expected = `DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT key.`;
    testFix(abap, expected);
  });

  it("EMPTY KEY quick fix, structured", async () => {
    const abap = `TYPES:
  BEGIN OF ty_line,
    origin TYPE voided,
    pedime TYPE STANDARD TABLE OF string WITH EMPTY KEY,
  END OF ty_line.`;
    const expected = `TYPES:
  BEGIN OF ty_line,
    origin TYPE voided,
    pedime TYPE STANDARD TABLE OF string WITH DEFAULT KEY,
  END OF ty_line.`;
    testFix(abap, expected);
  });

  it("EMPTY KEY quick fix, voided", async () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF voided WITH EMPTY KEY.`;
    const expected = `DATA tab TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.`;
    testFix(abap, expected);
  });

  it("downport CAST", async () => {
    const abap = `
    CLASS lcl_class DEFINITION.
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.
    FORM bar.
      DATA obj TYPE REF TO object.
      DATA foo TYPE REF TO object.
      foo = CAST lcl_class( obj ).
    ENDFORM.`;

    const expected = `
    CLASS lcl_class DEFINITION.
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.
    FORM bar.
      DATA obj TYPE REF TO object.
      DATA foo TYPE REF TO object.
      DATA temp1 TYPE REF TO lcl_class.
      temp1 ?= obj.
      foo = temp1.
    ENDFORM.`;

    testFix(abap, expected);
  });

  it("SPLIT into table", async () => {
    const abap = `
  DATA lv_text TYPE string.
  SPLIT lv_text AT |bar| INTO TABLE DATA(lt_rows).`;

    const expected = `
  DATA lv_text TYPE string.
  DATA lt_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  SPLIT lv_text AT |bar| INTO TABLE lt_rows.`;

    testFix(abap, expected);
  });

  it("LOOP assigning inline field symbol", async () => {
    const abap = `
  DATA lt_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  LOOP AT lt_rows ASSIGNING FIELD-SYMBOL(<lv_row>).
  ENDLOOP.`;

    const expected = `
  DATA lt_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  FIELD-SYMBOLS <lv_row> LIKE LINE OF lt_rows.
  LOOP AT lt_rows ASSIGNING <lv_row>.
  ENDLOOP.`;

    testFix(abap, expected);
  });

  it("CONV xstring", async () => {
    const abap = `
    DATA len TYPE i.
    len = xstrlen( CONV xstring( |AA| ) ).`;

    const expected = `
    DATA len TYPE i.
    DATA temp1 TYPE xstring.
    temp1 = |AA|.
    len = xstrlen( temp1 ).`;

    testFix(abap, expected);
  });

  it("CONV d", async () => {
    const abap = `
    DATA char8 TYPE c LENGTH 8.
    DATA bar TYPE d.
    char8 = '20210101'.
    bar = CONV d( char8 ).`;

    const expected = `
    DATA char8 TYPE c LENGTH 8.
    DATA bar TYPE d.
    char8 = '20210101'.
    DATA temp1 TYPE d.
    temp1 = char8.
    bar = temp1.`;

    testFix(abap, expected);
  });

  it("code after NEW", async () => {
    const abap = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    METHODS run
      RETURNING VALUE(self) TYPE REF TO lcl_clas.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA lo_module TYPE REF TO lcl_clas.
  lo_module = NEW lcl_clas( )->run( ).
ENDFORM.`;

    const expected = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    METHODS run
      RETURNING VALUE(self) TYPE REF TO lcl_clas.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA lo_module TYPE REF TO lcl_clas.
  DATA temp1 TYPE REF TO lcl_clas.
  CREATE OBJECT temp1 TYPE lcl_clas.
  lo_module = temp1->run( ).
ENDFORM.`;

    testFix(abap, expected);
  });

  it("outline structure type", async () => {
    const abap = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_structure,
             field TYPE i,
           END OF ty_structure.
    CLASS-METHODS run
      RETURNING VALUE(structure) TYPE ty_structure.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA(struc) = lcl_clas=>run( ).
ENDFORM.`;

    const expected = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_structure,
             field TYPE i,
           END OF ty_structure.
    CLASS-METHODS run
      RETURNING VALUE(structure) TYPE ty_structure.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA struc TYPE lcl_clas=>ty_structure.
  struc = lcl_clas=>run( ).
ENDFORM.`;

    testFix(abap, expected);
  });

  it("LOOP AT method call", async () => {
    const abap = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    CLASS-METHODS run RETURNING VALUE(tab) TYPE ty_tab.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA lv_int TYPE i.
  LOOP AT lcl_clas=>run( ) INTO lv_int.
  ENDLOOP.
ENDFORM.`;

    const expected = `
CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    CLASS-METHODS run RETURNING VALUE(tab) TYPE ty_tab.
ENDCLASS.
CLASS lcl_clas IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
FORM bar.
  DATA lv_int TYPE i.
  DATA(temp1) = lcl_clas=>run( ).
  LOOP AT temp1 INTO lv_int.
  ENDLOOP.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("APPEND VALUE #", async () => {
    const abap = `
FORM bar.
  TYPES: BEGIN OF ty_stru,
           field TYPE i,
           field2 TYPE i,
         END OF ty_stru.
  TYPES ty_tab TYPE STANDARD TABLE OF ty_stru WITH DEFAULT KEY.
  DATA tab TYPE ty_tab.
  APPEND VALUE #( field = 1 field2 = 2 ) TO tab.
ENDFORM.`;

    const expected = `
FORM bar.
  TYPES: BEGIN OF ty_stru,
           field TYPE i,
           field2 TYPE i,
         END OF ty_stru.
  TYPES ty_tab TYPE STANDARD TABLE OF ty_stru WITH DEFAULT KEY.
  DATA tab TYPE ty_tab.
  DATA temp1 TYPE ty_stru.
  temp1-field = 1.
  temp1-field2 = 2.
  APPEND temp1 TO tab.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("LOOP REFERENCE INTO DATA()", async () => {
    const abap = `
    DATA table TYPE STANDARD TABLE OF string.
    LOOP AT table REFERENCE INTO DATA(inline).
    ENDLOOP.`;

    const expected = `
    DATA table TYPE STANDARD TABLE OF string.
    DATA inline TYPE REF TO string.
    LOOP AT table REFERENCE INTO inline.
    ENDLOOP.`;

    testFix(abap, expected);
  });

  it("inline copy of table", async () => {
    const abap = `
    DATA txt_table TYPE STANDARD TABLE OF string.
    DATA(inline_txt_table) = txt_table.`;

    const expected = `
    DATA txt_table TYPE STANDARD TABLE OF string.
    DATA inline_txt_table LIKE txt_table.
    inline_txt_table = txt_table.`;

    testFix(abap, expected);
  });

  it("inline copy of table, structured", async () => {
    const abap = `
TYPES: BEGIN OF ty_struct,
  num TYPE i,
  txt TYPE string,
END OF ty_struct.
DATA struct_table TYPE STANDARD TABLE OF ty_struct WITH DEFAULT KEY.
DATA(inline_struct_table) = struct_table.`;

    const expected = `
TYPES: BEGIN OF ty_struct,
  num TYPE i,
  txt TYPE string,
END OF ty_struct.
DATA struct_table TYPE STANDARD TABLE OF ty_struct WITH DEFAULT KEY.
DATA inline_struct_table LIKE struct_table.
inline_struct_table = struct_table.`;

    testFix(abap, expected);
  });

  it("xsdbool", async () => {
    const abap = `
  DATA foo TYPE abap_bool.
  foo = xsdbool( 1 = 2 ).`;

    const expected = `
  DATA foo TYPE abap_bool.
  foo = boolc( 1 = 2 ).`;

    testFix(abap, expected);
  });

  it("VALUE appending to table", async () => {
    const abap = `
TYPES: BEGIN OF ty_hash,
         word  TYPE i,
         shift TYPE i,
       END OF ty_hash.
TYPES ty_tab TYPE STANDARD TABLE OF ty_hash WITH DEFAULT KEY.
DATA tab TYPE ty_tab.
tab = VALUE #( ( word = 0 shift = 3 ) ( word = 4 shift = 5 ) ).`;

    const expected = `
TYPES: BEGIN OF ty_hash,
         word  TYPE i,
         shift TYPE i,
       END OF ty_hash.
TYPES ty_tab TYPE STANDARD TABLE OF ty_hash WITH DEFAULT KEY.
DATA tab TYPE ty_tab.
DATA temp1 TYPE ty_tab.
DATA temp2 LIKE LINE OF temp1.
temp2-word = 0.
temp2-shift = 3.
APPEND temp2 TO temp1.
temp2-word = 4.
temp2-shift = 5.
APPEND temp2 TO temp1.
tab = temp1.`;

    testFix(abap, expected);
  });

  it("VALUE appending simple value to table", async () => {
    const abap = `
TYPES ty TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA(sdf) = VALUE ty( ( 1 ) ( 2 ) ).`;

    const expected = `
TYPES ty TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA temp1 TYPE ty.
APPEND 1 TO temp1.
APPEND 2 TO temp1.
DATA(sdf) = temp1.`;

    testFix(abap, expected);
  });

  it("VALUE with LET", async () => {
    const abap = `
TYPES: BEGIN OF params,
         foo TYPE i,
       END OF params.
DATA(parameters) = VALUE params(
  LET distance = 10 IN
  foo = distance ).`;

    const expected = `
TYPES: BEGIN OF params,
         foo TYPE i,
       END OF params.
DATA temp1 TYPE params.
DATA distance TYPE i.
distance = 10.
temp1-foo = distance.
DATA(parameters) = temp1.`;

    testFix(abap, expected);
  });

  it("VALUE with multiple LET", async () => {
    const abap = `
TYPES: BEGIN OF params,
         foo TYPE i,
       END OF params.
DATA(parameters) = VALUE params(
  LET distance = 10
  rotation = 25 IN
  foo = distance ).`;

    const expected = `
TYPES: BEGIN OF params,
         foo TYPE i,
       END OF params.
DATA temp1 TYPE params.
DATA distance TYPE i.
distance = 10.
DATA rotation TYPE i.
rotation = 25.
temp1-foo = distance.
DATA(parameters) = temp1.`;

    testFix(abap, expected);
  });

  it("downport, generic field symbol types", async () => {
    const issues = await findIssues(`
  FIELD-SYMBOLS <tab> TYPE ANY TABLE.
  LOOP AT <tab> ASSIGNING FIELD-SYMBOL(<fs>).
  ENDLOOP.`);
    expect(issues.length).to.equal(1);
  });

  it("downport, voided via RETURNING", async () => {
    const issues = await findIssues(`
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS run.
    METHODS read RETURNING VALUE(rs_voided) TYPE voided.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD run.
    DATA(sdf) = read( ).
  ENDMETHOD.
  METHOD read.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
  });

  it("downport, append #, with ddic table type", async () => {
    const abap = `FORM bar.
  DATA tab TYPE ztab.
  APPEND VALUE #( msg = sy-msgv1 ) TO tab.
ENDFORM.`;
    const expected = `FORM bar.
  DATA tab TYPE ztab.
  DATA temp1 TYPE zrow.
  temp1-msg = sy-msgv1.
  APPEND temp1 TO tab.
ENDFORM.`;

    const zrow = new MemoryFile("zrow.tabl.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZROW</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>row</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MSG</FIELDNAME>
     <ROLLNAME>MSGV1</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`);

    const ztab = new MemoryFile("ztab.ttyp.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZTAB</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>ZROW</ROWTYPE>
    <ROWKIND>S</ROWKIND>
    <DATATYPE>STRU</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>tab</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`);

    testFix(abap, expected, [ztab, zrow]);
  });

  it("Outline, even though its voided", async () => {
    const abap = `
  DATA temp1 TYPE voided.
  DATA(ls_msg) = temp1.`;

    const expected = `
  DATA temp1 TYPE voided.
  DATA ls_msg LIKE temp1.
  ls_msg = temp1.`;

    testFix(abap, expected);
  });

  it("Table expression, by index", async () => {
    const abap = `FORM bar.
  rv_lognumber = lt_lognumbers[ 1 ]-lognumber.
ENDFORM.`;

    const expected = `FORM bar.
  DATA temp1 LIKE LINE OF lt_lognumbers.
  READ TABLE lt_lognumbers INDEX 1 INTO temp1.
  IF sy-subrc <> 0.
    RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
  ENDIF.
  rv_lognumber = temp1-lognumber.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("SELECT SINGLE, outline @DATA, basic", async () => {
    const abap = `FORM bar.
  SELECT SINGLE werks, bwkey FROM t001w INTO @DATA(ls_t001w) WHERE werks = '123'.
ENDFORM.`;

    const expected = `FORM bar.
  DATA: BEGIN OF ls_t001w,
          werks TYPE t001w-werks,
          bwkey TYPE t001w-bwkey,
        END OF ls_t001w.
  SELECT SINGLE werks, bwkey FROM t001w INTO @ls_t001w WHERE werks = '123'.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("SELECT, outline @DATA, table", async () => {
    const abap = `FORM bar.
  SELECT werks, bwkey FROM t001w INTO TABLE @DATA(lt_t001w).
ENDFORM.`;

    const expected = `FORM bar.
  TYPES: BEGIN OF temp1,
          werks TYPE t001w-werks,
          bwkey TYPE t001w-bwkey,
        END OF temp1.
  DATA lt_t001w TYPE STANDARD TABLE OF temp1 WITH DEFAULT KEY.
  SELECT werks, bwkey FROM t001w INTO TABLE @lt_t001w.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("SELECT, basic remove , and @", async () => {
    const abap = `FORM bar.
  DATA: BEGIN OF ls_t001w,
          werks TYPE t001w-werks,
          bwkey TYPE t001w-bwkey,
        END OF ls_t001w.
  SELECT SINGLE werks, bwkey FROM t001w INTO @ls_t001w WHERE werks = '123'.
ENDFORM.`;

    const expected = `FORM bar.
  DATA: BEGIN OF ls_t001w,
          werks TYPE t001w-werks,
          bwkey TYPE t001w-bwkey,
        END OF ls_t001w.
  SELECT SINGLE werks bwkey FROM t001w INTO ls_t001w WHERE werks = '123'.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("SELECT, single field into @DATA", async () => {
    const abap = `FORM bar.
  SELECT SINGLE field FROM tab INTO @DATA(bar).
ENDFORM.`;

    const expected = `FORM bar.
  DATA bar TYPE tab-field.
  SELECT SINGLE field FROM tab INTO @bar.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("Outline, via type inference", async () => {
    const abap = `DATA mv_hex TYPE xstring.
DATA(lv_topbit) = mv_hex(1) MOD 128.`;

    const expected = `DATA mv_hex TYPE xstring.
DATA lv_topbit TYPE i.
lv_topbit = mv_hex(1) MOD 128.`;

    testFix(abap, expected);
  });

  it("Outline, field chain with length", async () => {
    const abap = `DATA mv_hex TYPE xstring.
DATA(lv_topbit) = mv_hex(1).`;

    const expected = `DATA mv_hex TYPE xstring.
DATA lv_topbit TYPE xstring.
lv_topbit = mv_hex(1).`;

    testFix(abap, expected);
  });

  it("Outline, field chain with offset", async () => {
    const abap = `DATA mv_hex TYPE xstring.
DATA(lv_topbit) = mv_hex+1.`;

    const expected = `DATA mv_hex TYPE xstring.
DATA lv_topbit TYPE xstring.
lv_topbit = mv_hex+1.`;

    testFix(abap, expected);
  });

  it("downport, ALPHA = IN", async () => {
    const abap = `temp2-ebelp = |{ ls_line-no ALPHA = IN }|.`;

    const expected = `CALL FUNCTION 'CONVERSION_EXIT_ALPHA_INPUT'
  EXPORTING
    input  = ls_line-no
  IMPORTING
    output = temp2-ebelp.`;

    testFix(abap, expected);
  });

  it("COND #", async () => {
    const abap = `DATA field TYPE i.
field = COND #( WHEN 'a' = 'b' THEN 2 ELSE 3 ).`;

    const expected = `DATA field TYPE i.
DATA temp1 TYPE i.
IF 'a' = 'b'.
  temp1 = 2.
ELSE.
  temp1 = 3.
ENDIF.
field = temp1.`;

    testFix(abap, expected);
  });

  it("REDUCE", async () => {
    const abap = `point_data = REDUCE string(
  INIT res = ||
  FOR point IN params-points
  NEXT res = res && |moo| ).`;

    const expected = `DATA temp1 TYPE string.
DATA(res) = ||.
LOOP AT params-points INTO DATA(point).
  res = res && |moo|.
ENDLOOP.
temp1 = res.
point_data = temp1.`;

    testFix(abap, expected);
  });

  it("REDUCE, field symbol", async () => {
    const abap = `point_data = REDUCE string(
  INIT res = ||
  FOR <point> IN params-points
  NEXT res = res && |moo| ).`;

    const expected = `DATA temp1 TYPE string.
DATA(res) = ||.
LOOP AT params-points ASSIGNING FIELD-SYMBOL(<point>).
  res = res && |moo|.
ENDLOOP.
temp1 = res.
point_data = temp1.`;

    testFix(abap, expected);
  });

  it("VALUE with FOR field symbol loop, tabular", async () => {
    const abap = `TYPES: BEGIN OF ty_turtles,
    field TYPE i,
  END OF ty_turtles.
TYPES tt_turtles TYPE STANDARD TABLE OF ty_turtles WITH DEFAULT KEY.
DATA turtles TYPE tt_turtles.
DATA new_height TYPE tt_turtles.
new_height = VALUE #( FOR <x> IN turtles ( <x> ) ).`;

    const expected = `TYPES: BEGIN OF ty_turtles,
    field TYPE i,
  END OF ty_turtles.
TYPES tt_turtles TYPE STANDARD TABLE OF ty_turtles WITH DEFAULT KEY.
DATA turtles TYPE tt_turtles.
DATA new_height TYPE tt_turtles.
DATA temp1 TYPE tt_turtles.
LOOP AT turtles ASSIGNING FIELD-SYMBOL(<x>).
  APPEND <x> TO temp1.
ENDLOOP.
new_height = temp1.`;

    testFix(abap, expected);
  });

  it("nested VALUE # returning", async () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS method1
      IMPORTING input TYPE i.
    METHODS method2
      IMPORTING foo        TYPE i
      RETURNING VALUE(val) TYPE i.
    METHODS impl.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
  METHOD impl.
    method1( method2( VALUE #( ) ) ).
  ENDMETHOD.
ENDCLASS.`;

    const expected = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS method1
      IMPORTING input TYPE i.
    METHODS method2
      IMPORTING foo        TYPE i
      RETURNING VALUE(val) TYPE i.
    METHODS impl.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
  METHOD impl.
    DATA temp1 TYPE i.
    method1( method2( temp1 ) ).
  ENDMETHOD.
ENDCLASS.`;

    testFix(abap, expected);
  });

  it("remove PARTIALLY IMPLEMENTED", async () => {
    const abap = `
    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        INTERFACES lif_bar PARTIALLY IMPLEMENTED.
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.`;

    const expected = `
    CLASS lcl_class DEFINITION.
      PUBLIC SECTION.
        INTERFACES lif_bar .
    ENDCLASS.
    CLASS lcl_class IMPLEMENTATION.
    ENDCLASS.`;

    testFix(abap, expected);
  });

  it("downport RAISE ... MESSAGE ID", async () => {
    const abap = `
RAISE EXCEPTION TYPE zcx_see MESSAGE ID 'ZSEE' NUMBER '001'.`;

    const expected = `
DATA temp1 LIKE if_t100_message=>t100key.
temp1-msgid = 'ZSEE'.
temp1-msgno = '001'.
DATA temp2 TYPE REF TO zcx_see.
CREATE OBJECT temp2 EXPORTING textid = temp1.
RAISE EXCEPTION temp2.`;

    testFix(abap, expected);
  });

  it("APPEND, outline expression", async () => {
    const abap = `
FORM foo.
  DATA input_letters TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  APPEND |sdfsd| TO input_letters.
ENDFORM.`;

    const expected = `
FORM foo.
  DATA input_letters TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA temp1 LIKE LINE OF input_letters.
  temp1 = |sdfsd|.
  APPEND temp1 TO input_letters.
ENDFORM.`;

    testFix(abap, expected);
  });

// ---------------------

  it.skip("line_exists()", async () => {
    const abap = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  IF line_exists( lt_list[ table_line = 123 ] ).
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    const expected = `FORM bar.
  READ TABLE lt_list WITH KEY table_line = 123 TRANSPORTING NO FIELDS.
  IF sy-subrc = 0.
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    testFix(abap, expected);
  });

});
