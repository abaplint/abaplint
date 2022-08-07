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

  it("CALL FUNCTION, ok, no downport", async () => {
    const issues = await findIssues(`CALL FUNCTION 'SCMS_BASE64_ENCODE_STR'
  EXPORTING
    input  = temp1
  IMPORTING
    output = lv_string.`);
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
  CLEAR temp1.
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
CLEAR temp1.
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

  it("VALUE appending to table, voided type", async () => {
    const abap = `
TYPES ty_tab TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
DATA tab TYPE ty_tab.
tab = VALUE #( ( word = 0 shift = 3 ) ( word = 4 shift = 5 ) ).`;

    const expected = `
TYPES ty_tab TYPE STANDARD TABLE OF voided WITH DEFAULT KEY.
DATA tab TYPE ty_tab.
DATA temp1 TYPE ty_tab.
CLEAR temp1.
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

  it("VALUE appending to table, top level, no qualified name", async () => {
    const abap = `
DATA tab TYPE RANGE OF i.
tab = VALUE #( ( low = 0 ) ).`;

    const expected = `
DATA tab TYPE RANGE OF i.
DATA temp1 LIKE tab.
CLEAR temp1.
DATA temp2 LIKE LINE OF temp1.
temp2-low = 0.
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
CLEAR temp1.
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
CLEAR temp1.
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
CLEAR temp1.
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

  it("downport, append #, with ddic table type", async () => {
    const abap = `FORM bar.
  DATA tab TYPE ztab.
  APPEND VALUE #( msg = sy-msgv1 ) TO tab.
ENDFORM.`;
    const expected = `FORM bar.
  DATA tab TYPE ztab.
  DATA temp1 TYPE zrow.
  CLEAR temp1.
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
  DATA temp2 LIKE sy-tabix.
  temp2 = sy-tabix.
  READ TABLE lt_lognumbers INDEX 1 INTO temp1.
  sy-tabix = temp2.
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

  it("SELECT star, outline @DATA, table", async () => {
    const abap = `FORM bar.
  SELECT * FROM t001w INTO TABLE @DATA(lt_t001w).
ENDFORM.`;

    const expected = `FORM bar.
  DATA lt_t001w TYPE STANDARD TABLE OF t001w WITH DEFAULT KEY.
  SELECT * FROM t001w INTO TABLE @lt_t001w.
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

  it("downport, ALPHA = OUT", async () => {
    const abap = `DATA iv_in TYPE matnr.
DATA rv_out TYPE string.
rv_out = condense( |{ iv_in ALPHA = OUT }| ).`;

    const expected = `DATA iv_in TYPE matnr.
DATA rv_out TYPE string.
DATA temp1 TYPE string.
CALL FUNCTION 'CONVERSION_EXIT_ALPHA_OUTPUT'
  EXPORTING
    input  = iv_in
  IMPORTING
    output = temp1.
rv_out = condense( temp1 ).`;

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

  it("COND #, multiple WHEN", async () => {
    const abap = `
  DATA field TYPE i.
  field = COND #(
    WHEN 'a' = 'b' THEN 2
    WHEN 'a' = 'b' THEN 2
    ELSE 3 ).`;

    const expected = `
  DATA field TYPE i.
  DATA temp1 TYPE i.
  IF 'a' = 'b'.
    temp1 = 2.
  ELSEIF 'a' = 'b'.
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
CLEAR temp1.
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
    CLEAR temp1.
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

  it("downport RAISE ... MESSAGE ID unescaped variant", async () => {
    const abap = `
RAISE EXCEPTION TYPE zcx_foo MESSAGE ID 'ZFOO' NUMBER 002.`;

    const expected = `
DATA temp1 LIKE if_t100_message=>t100key.
temp1-msgid = 'ZFOO'.
temp1-msgno = '002'.
DATA temp2 TYPE REF TO zcx_foo.
CREATE OBJECT temp2 EXPORTING textid = temp1.
RAISE EXCEPTION temp2.`;

    testFix(abap, expected);
  });

  it("downport RAISE ... MESSAGE", async () => {
    const abap = `
RAISE EXCEPTION TYPE zcx_tools MESSAGE e100(zfoo).`;

    const expected = `
DATA temp1 LIKE if_t100_message=>t100key.
temp1-msgid = 'ZFOO'.
temp1-msgno = '100'.
DATA temp2 TYPE REF TO zcx_tools.
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

  it("COND # inside string template", async () => {
    const abap = `
DATA input TYPE string.
DATA(result) = |foo { COND #( WHEN input IS INITIAL THEN \`you\` ELSE input ) } bar|.`;

    const expected = `
DATA input TYPE string.
DATA temp1 TYPE string.
IF input IS INITIAL.
  temp1 = \`you\`.
ELSE.
  temp1 = input.
ENDIF.
DATA(result) = |foo { temp1 } bar|.`;

    testFix(abap, expected);
  });

  it("INSERT, basic remove @", async () => {
    const abap = `INSERT INTO opentest VALUES @ls_row.`;
    const expected = `INSERT INTO opentest VALUES ls_row.`;
    testFix(abap, expected);
  });

  it("COND nested in string template", async () => {
    const abap = `DATA count TYPE i.
DATA result TYPE string.
result = |{ COND #( WHEN count = 0 THEN |bar| ) }|.`;
    const expected = `DATA count TYPE i.
DATA result TYPE string.
DATA temp1 TYPE string.
IF count = 0.
  temp1 = |bar|.
ELSE.
  CLEAR temp1.
ENDIF.
result = |{ temp1 }|.`;
    testFix(abap, expected);
  });

  it("COND with LET", async () => {
    const abap = `
  WRITE COND string(
    LET current_count = 2
        new_count = current_count - 1
    IN
    WHEN current_count = 1 THEN |{ current_count }|
    ELSE |{ new_count }| ).`;
    const expected = `
  DATA temp1 TYPE string.
  DATA current_count TYPE i.
  current_count = 2.
  DATA new_count TYPE i.
  new_count = current_count - 1.
  IF current_count = 1.
    temp1 = |{ current_count }|.
  ELSE.
    temp1 = |{ new_count }|.
  ENDIF.
  WRITE temp1.`;
    testFix(abap, expected);
  });

  it("VALUE with FOR", async () => {
    const abap = `
TYPES ty_tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA tab TYPE ty_tab.
tab = VALUE ty_tab( FOR i = 0 UNTIL i = 2 ( |hello| ) ).`;
    const expected = `
TYPES ty_tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA tab TYPE ty_tab.
DATA temp1 TYPE ty_tab.
CLEAR temp1.
DATA i TYPE i.
i = 0.
DATA temp2 LIKE sy-index.
temp2 = sy-index.
WHILE NOT i = 2.
  sy-index = temp2.
  APPEND |hello| TO temp1.
  i = i + 1.
ENDWHILE.
tab = temp1.`;
    testFix(abap, expected);
  });

  it("same var, double inline", async () => {
    const abap = `
TYPES ty_tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA(result) = VALUE ty_tab(
  ( COND string( LET current_count = 2 IN
    WHEN current_count = 1 THEN |{ current_count }|
    ELSE |{ current_count }| )
  )
  ( COND string( LET current_count = 2 IN
    WHEN current_count = 2 THEN |{ current_count }|
    ELSE |{ current_count }| )
  ) ).`;
// note, the unit tests only perform one step
    const expected = `
TYPES ty_tab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA temp1 TYPE ty_tab.
CLEAR temp1.
APPEND COND string( LET current_count = 2 IN WHEN current_count = 1 THEN |{ current_count }| ELSE |{ current_count }| ) TO temp1.
APPEND COND string( LET current_count = 2 IN WHEN current_count = 2 THEN |{ current_count }| ELSE |{ current_count }| ) TO temp1.
DATA(result) = temp1.`;
    testFix(abap, expected);
  });

  it("Move, +=", async () => {
    const abap = `
    DATA int TYPE i.
    int += 2.`;
// note, the unit tests only perform one step
    const expected = `
    DATA int TYPE i.
    int = int + 2.`;
    testFix(abap, expected);
  });

  it("Move, -=", async () => {
    const abap = `
    DATA int TYPE i.
    int -= 2.`;
// note, the unit tests only perform one step
    const expected = `
    DATA int TYPE i.
    int = int - 2.`;
    testFix(abap, expected);
  });

  it("Move, *=", async () => {
    const abap = `
    DATA int TYPE i.
    int *= 2.`;
// note, the unit tests only perform one step
    const expected = `
    DATA int TYPE i.
    int = int * 2.`;
    testFix(abap, expected);
  });

  it("Move, /=", async () => {
    const abap = `
    DATA int TYPE i.
    int /= 2.`;
// note, the unit tests only perform one step
    const expected = `
    DATA int TYPE i.
    int = int / 2.`;
    testFix(abap, expected);
  });

  it("Move, &&=", async () => {
    const abap = `
    DATA int TYPE string.
    int &&= 2.`;
// note, the unit tests only perform one step
    const expected = `
    DATA int TYPE string.
    int = int && 2.`;
    testFix(abap, expected);
  });

  it("line_exists()", async () => {
    const abap = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  IF line_exists( lt_list[ table_line = 123 ] ).
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    const expected = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA temp1 LIKE sy-subrc.
  READ TABLE lt_list WITH KEY table_line = 123 TRANSPORTING NO FIELDS.
  temp1 = sy-subrc.
  IF temp1 = 0.
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("line_exists(), two fields, voided", async () => {
    const abap = `FORM bar.
  DATA lt_list TYPE voided.
  IF line_exists( lt_list[ foo = 123 bar = 2 ] ).
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    const expected = `FORM bar.
  DATA lt_list TYPE voided.
  DATA temp1 LIKE sy-subrc.
  READ TABLE lt_list WITH KEY foo = 123 bar = 2 TRANSPORTING NO FIELDS.
  temp1 = sy-subrc.
  IF temp1 = 0.
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("line_exists(), two fields, two times, voided", async () => {
    const abap = `FORM bar.
  DATA lt_list TYPE voided.
  IF line_exists( lt_list[ foo = 123 bar = '2' ] ) OR line_exists( lt_list[ foo = 1 bar = 5 ] ).
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    const expected = `FORM bar.
  DATA lt_list TYPE voided.
  DATA temp1 LIKE sy-subrc.
  READ TABLE lt_list WITH KEY foo = 123 bar = '2' TRANSPORTING NO FIELDS.
  temp1 = sy-subrc.
  IF temp1 = 0 OR line_exists( lt_list[ foo = 1 bar = 5 ] ).
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("line_exists(), index", async () => {
    const abap = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  IF line_exists( lt_list[ 1 ] ).
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    const expected = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA temp1 LIKE sy-subrc.
  READ TABLE lt_list INDEX 1 TRANSPORTING NO FIELDS.
  temp1 = sy-subrc.
  IF temp1 = 0.
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("line_index()", async () => {
    const abap = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  IF line_index( lt_list[ table_line = 123 ] ) = 2.
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    const expected = `FORM bar.
  DATA lt_list TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA temp1 LIKE sy-subrc.
  READ TABLE lt_list WITH KEY table_line = 123 TRANSPORTING NO FIELDS.
  temp1 = sy-tabix.
  IF temp1 = 2.
    WRITE / 'hello'.
  ENDIF.
ENDFORM.`;

    testFix(abap, expected);
  });

  it("Basic SWITCH", async () => {
    const abap = `
  DATA result TYPE string.
  DATA asset_type TYPE string.
  result = SWITCH #(
    asset_type
    WHEN 'CSS' THEN |temp1|
    WHEN 'HTML' THEN |sdfs|
    ELSE |sdf| ).`;

    const expected = `
  DATA result TYPE string.
  DATA asset_type TYPE string.
  DATA temp1 TYPE string.
  CASE asset_type.
    WHEN 'CSS'.
      temp1 = |temp1|.
    WHEN 'HTML'.
      temp1 = |sdfs|.
    WHEN OTHERS.
      temp1 = |sdf|.
  ENDCASE.
  result = temp1.`;

    testFix(abap, expected);
  });

  it("Table expression, by component", async () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         foo TYPE i,
       END OF ty_type.
DATA tab TYPE STANDARD TABLE OF ty_type WITH DEFAULT KEY.
WRITE tab[ foo = 2 ]-foo.`;

    const expected = `
TYPES: BEGIN OF ty_type,
         foo TYPE i,
       END OF ty_type.
DATA tab TYPE STANDARD TABLE OF ty_type WITH DEFAULT KEY.
DATA temp1 LIKE LINE OF tab.
DATA temp2 LIKE sy-tabix.
temp2 = sy-tabix.
READ TABLE tab WITH KEY foo = 2 INTO temp1.
sy-tabix = temp2.
IF sy-subrc <> 0.
  RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
ENDIF.
WRITE temp1-foo.`;

    testFix(abap, expected);
  });

  it("SELECT SINGLE star", async () => {
    const abap = `
  SELECT SINGLE * FROM zfoobar INTO @DATA(ls_cfg) WHERE field = 'MOO'.`;

    const expected = `
  DATA ls_cfg TYPE zfoobar.
  SELECT SINGLE * FROM zfoobar INTO @ls_cfg WHERE field = 'MOO'.`;

    testFix(abap, expected);
  });

  it("inline and table expression", async () => {
    const abap = `
TYPES: BEGIN OF ty_type,
         identifier TYPE string,
         ispub      TYPE abap_bool,
       END OF ty_type.
DATA: BEGIN OF ls_meta,
        page TYPE STANDARD TABLE OF ty_type,
      END OF ls_meta.
DATA(ls_entry) = ls_meta-page[ identifier = |sdf| ispub = abap_true ].`;

    const expected = `
TYPES: BEGIN OF ty_type,
         identifier TYPE string,
         ispub      TYPE abap_bool,
       END OF ty_type.
DATA: BEGIN OF ls_meta,
        page TYPE STANDARD TABLE OF ty_type,
      END OF ls_meta.
DATA ls_entry TYPE ty_type.
ls_entry = ls_meta-page[ identifier = |sdf| ispub = abap_true ].`;

    testFix(abap, expected);
  });

  it("outline, SELECT COUNT", async () => {
    const abap = `SELECT COUNT( * ) FROM zbar INTO @DATA(lv_count) WHERE foo = 'abc'.`;
    const expected = `DATA lv_count TYPE i.
SELECT COUNT( * ) FROM zbar INTO @lv_count WHERE foo = 'abc'.`;
    testFix(abap, expected);
  });

  it("CALL METHOD with CONV #", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get_token
      IMPORTING
        iv_username TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_token.
    CALL METHOD lcl=>get_token
      EXPORTING
        iv_username = CONV #( 'abc' ).
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get_token
      IMPORTING
        iv_username TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_token.
    DATA temp1 TYPE string.
    temp1 = 'abc'.
    CALL METHOD lcl=>get_token
      EXPORTING
        iv_username = temp1.
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("CALL METHOD with CONV #", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get_token
      IMPORTING
        iv_username TYPE string
      EXPORTING
        bar         TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_token.
    DATA lv TYPE string.
    CALL METHOD lcl=>get_token
      EXPORTING
        iv_username = CONV #( 'abc' )
      IMPORTING
        bar         = lv.
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get_token
      IMPORTING
        iv_username TYPE string
      EXPORTING
        bar         TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD get_token.
    DATA lv TYPE string.
    DATA temp1 TYPE string.
    temp1 = 'abc'.
    CALL METHOD lcl=>get_token
      EXPORTING
        iv_username = temp1
      IMPORTING
        bar         = lv.
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("APPEND INITIAL LINE, voided types", async () => {
    const abap = `
    DATA tab TYPE voided.
    APPEND INITIAL LINE TO tab ASSIGNING FIELD-SYMBOL(<fs>).`;

    const expected = `
    DATA tab TYPE voided.
    FIELD-SYMBOLS <fs> LIKE LINE OF tab.
    APPEND INITIAL LINE TO tab ASSIGNING <fs>.`;

    testFix(abap, expected);
  });

  it("MAX inline", async () => {
    const abap = `
  SELECT MAX( field ) INTO @DATA(lv_field) FROM dbtab WHERE blah EQ 'sdf'.`;

    const expected = `
  DATA lv_field TYPE dbtab-field.
  SELECT MAX( field ) INTO @lv_field FROM dbtab WHERE blah EQ 'sdf'.`;

    testFix(abap, expected);
  });

  it("table expression, voided type", async () => {
    const abap = `
    DATA lt_return2 TYPE voided.
    DATA(ls_return2) = lt_return2[ type = 'E' ].`;

    const expected = `
    DATA lt_return2 TYPE voided.
    DATA ls_return2 LIKE LINE OF lt_return2.
    ls_return2 = lt_return2[ type = 'E' ].`;

    testFix(abap, expected);
  });

  it("downport, single character", async () => {
    const abap = `DATA(lv_col) = '*'.`;
    const expected = `DATA lv_col TYPE c LENGTH 1.
lv_col = '*'.`;
    testFix(abap, expected);
  });

  it("downport, zero character", async () => {
    const abap = `DATA(lv_col) = ''.`;
    const expected = `DATA lv_col TYPE c LENGTH 1.
lv_col = ''.`;
    testFix(abap, expected);
  });

  it("SELECT LOOP, basic", async () => {
    const abap = `
  SELECT * FROM voiddbtab INTO @DATA(ls_db) UP TO 1 ROWS WHERE field = 'sdfs'.
  ENDSELECT.`;
    const expected = `
  DATA ls_db TYPE voiddbtab.
  SELECT * FROM voiddbtab INTO @ls_db UP TO 1 ROWS WHERE field = 'sdfs'.
  ENDSELECT.`;
    testFix(abap, expected);
  });

  it("SELECT LOOP, downport at", async () => {
    const abap = `
  DATA ls_db TYPE voiddbtab.
  SELECT * FROM voiddbtab INTO @ls_db UP TO 1 ROWS WHERE field = 'sdfs'.
  ENDSELECT.`;
    const expected = `
  DATA ls_db TYPE voiddbtab.
  SELECT * FROM voiddbtab INTO ls_db UP TO 1 ROWS WHERE field = 'sdfs'.
  ENDSELECT.`;
    testFix(abap, expected);
  });

  it("SELECT LOOP, downport comma", async () => {
    const abap = `
  DATA ls_db TYPE voiddbtab.
  SELECT foo, bar FROM voiddbtab INTO @ls_db UP TO 1 ROWS WHERE field = 'sdfs'.
  ENDSELECT.`;
    const expected = `
  DATA ls_db TYPE voiddbtab.
  SELECT foo bar FROM voiddbtab INTO ls_db UP TO 1 ROWS WHERE field = 'sdfs'.
  ENDSELECT.`;
    testFix(abap, expected);
  });

  it("basic, SELECT INNER JOIN", async () => {
    const abap = `
SELECT aufk~aufnr, afko~aufpl, afvc~objnr
  FROM aufk
  INNER JOIN afko ON afko~aufnr = aufk~aufnr
  INNER JOIN afvc ON afvc~aufpl = afko~aufpl
  INTO TABLE @DATA(lt_data).`;
    const expected = `
TYPES: BEGIN OF temp1,
        aufnr TYPE aufk-aufnr,
        aufpl TYPE afko-aufpl,
        objnr TYPE afvc-objnr,
      END OF temp1.
DATA lt_data TYPE STANDARD TABLE OF temp1 WITH DEFAULT KEY.
SELECT aufk~aufnr, afko~aufpl, afvc~objnr
  FROM aufk
  INNER JOIN afko ON afko~aufnr = aufk~aufnr
  INNER JOIN afvc ON afvc~aufpl = afko~aufpl
  INTO TABLE @lt_data.`;
    testFix(abap, expected);
  });

  it("voided structure, VALUE", async () => {
    const abap = `
  DATA temp33 TYPE voided.
  temp33 = VALUE #( line = 'moo' ).`;
    const expected = `
  DATA temp33 TYPE voided.
  CLEAR temp33.
  temp33-line = 'moo'.`;
    testFix(abap, expected);
  });

  it("CATCH voided into inline", async () => {
    const abap = `
TRY.
  CATCH cx_bcs INTO DATA(lx_bcs_excep).
ENDTRY.`;
    const expected = `
TRY.
    DATA lx_bcs_excep TYPE REF TO cx_bcs.
  CATCH cx_bcs INTO lx_bcs_excep.
ENDTRY.`;
    testFix(abap, expected);
  });

  it("outline table expression first, type is voided", async () => {
    const abap = `
  DATA it_operations TYPE voided.
  DATA(lv_text) = it_operations[ activity = 2 ]-description.`;
    const expected = `
  DATA it_operations TYPE voided.
  DATA temp1 LIKE LINE OF it_operations.
  DATA temp2 LIKE sy-tabix.
  temp2 = sy-tabix.
  READ TABLE it_operations WITH KEY activity = 2 INTO temp1.
  sy-tabix = temp2.
  IF sy-subrc <> 0.
    RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
  ENDIF.
  DATA(lv_text) = temp1-description.`;
    testFix(abap, expected);
  });

  it("downport, searching for type in Include", async () => {
    const abap = `FORM bar.
  DATA(lv_len) = strlen( |sdfds| ).
ENDFORM.`;
    const zincl = new MemoryFile("zincl.prog.abap", abap);
    const zinclxml = new MemoryFile("zincl.prog.xml", `<SUBC>I</SUBC>`);
    const zmain = new MemoryFile("zmain.prog.abap", `INCLUDE zincl.`);

    const reg = new Registry(buildConfig());
    reg.addFile(zincl);
    reg.addFile(zmain);
    reg.addFile(zinclxml);
    reg.parse();
    const issues = new Downport().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1, "single issue expected");
    expect(issues[0].getFix()).to.not.equal(undefined);
  });

  it("line_eixsts, dashed source table", async () => {
    const abap = `
    DATA ls_update TYPE voided.
    IF line_exists( ls_update-users[ table_line = 2 ] ).
    ENDIF.`;
    const expected = `
    DATA ls_update TYPE voided.
    DATA temp1 LIKE sy-subrc.
    READ TABLE ls_update-users WITH KEY table_line = 2 TRANSPORTING NO FIELDS.
    temp1 = sy-subrc.
    IF temp1 = 0.
    ENDIF.`;
    testFix(abap, expected);
  });

  it("REDUCE with WHILE", async () => {
    const abap = `
    DATA input TYPE string.
    DATA result TYPE string.
    input = 'sdfs'.
    result = REDUCE string( INIT s = 0
      FOR  i = 0 WHILE i < strlen( input )
      NEXT s = s + 1 ).
    WRITE result.`;
    const expected = `
    DATA input TYPE string.
    DATA result TYPE string.
    input = 'sdfs'.
    DATA temp1 TYPE string.
    DATA(s) = 0.
    DATA i TYPE i.
    i = 0.
    DATA temp2 LIKE sy-index.
    temp2 = sy-index.
    WHILE i < strlen( input ).
      sy-index = temp2.
      s = s + 1.
      i = i + 1.
    ENDWHILE.
    temp1 = s.
    result = temp1.
    WRITE result.`;
    testFix(abap, expected);
  });

  it("target with table expression", async () => {
    const abap = `
    DATA itab TYPE STANDARD TABLE OF i.
    APPEND 1 TO itab.
    itab[ 1 ] = 2.`;
    const expected = `
    DATA itab TYPE STANDARD TABLE OF i.
    APPEND 1 TO itab.
    FIELD-SYMBOLS <temp1> LIKE LINE OF itab.
    DATA temp2 LIKE sy-tabix.
    temp2 = sy-tabix.
    READ TABLE itab INDEX 1 ASSIGNING <temp1>.
    sy-tabix = temp2.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
    ENDIF.
    <temp1> = 2.`;
    testFix(abap, expected);
  });

  it("contains()", async () => {
    const abap = `
    DATA current_val TYPE string.
    IF contains( val = 'AEIOULNRST' sub = current_val ).
    ENDIF.`;
    const expected = `
    DATA current_val TYPE string.
    IF 'AEIOULNRST' CS current_val.
    ENDIF.`;
    testFix(abap, expected);
  });

  it("VALUE, empty row", async () => {
    const abap = `
    DATA input TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    input  = VALUE #( ( ) ).`;
    const expected = `
    DATA input TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA temp1 LIKE input.
    CLEAR temp1.
    DATA temp2 LIKE LINE OF temp1.
    APPEND temp2 TO temp1.
    input  = temp1.`;
    testFix(abap, expected);
  });

  it("VALUE, two empty rows", async () => {
    const abap = `
    DATA input TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    input  = VALUE #( ( ) ( ) ).`;
    const expected = `
    DATA input TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA temp1 LIKE input.
    CLEAR temp1.
    DATA temp2 LIKE LINE OF temp1.
    APPEND temp2 TO temp1.
    APPEND temp2 TO temp1.
    input  = temp1.`;
    testFix(abap, expected);
  });

  it("Another REDUCE testcase", async () => {
    const abap = `
    DATA int TYPE string.
    int = REDUCE string( INIT s = || FOR i = 0 UNTIL i > 2 NEXT s = s && i ).
    WRITE int.`;
    const expected = `
    DATA int TYPE string.
    DATA temp1 TYPE string.
    DATA(s) = ||.
    DATA i TYPE i.
    i = 0.
    DATA temp2 LIKE sy-index.
    temp2 = sy-index.
    WHILE NOT i > 2.
      sy-index = temp2.
      s = s && i.
      i = i + 1.
    ENDWHILE.
    temp1 = s.
    int = temp1.
    WRITE int.`;
    testFix(abap, expected);
  });

  it("REDUCE with &&= in body", async () => {
    const abap = `
    DATA int TYPE string.
    int = REDUCE string( INIT s = || FOR i = 0 UNTIL i > 2 NEXT s &&= i ).
    WRITE int.`;
    const expected = `
    DATA int TYPE string.
    DATA temp1 TYPE string.
    DATA(s) = ||.
    DATA i TYPE i.
    i = 0.
    DATA temp2 LIKE sy-index.
    temp2 = sy-index.
    WHILE NOT i > 2.
      sy-index = temp2.
      s &&= i.
      i = i + 1.
    ENDWHILE.
    temp1 = s.
    int = temp1.
    WRITE int.`;
    testFix(abap, expected);
  });

  it("VALUE FOR IN tab", async () => {
    const abap = `
  DATA results TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA garden_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  results = VALUE #( FOR row IN garden_rows ( row ) ).`;
    const expected = `
  DATA results TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA garden_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA temp1 LIKE results.
  CLEAR temp1.
  LOOP AT garden_rows INTO DATA(row).
    APPEND row TO temp1.
  ENDLOOP.
  results = temp1.`;
    testFix(abap, expected);
  });

  it("VALUE, double FOR loop", async () => {
    const abap = `
  DATA results TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA garden_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  results = VALUE #(
    FOR row IN garden_rows
    FOR seed = 0 WHILE seed <= 1
    ( row && seed ) ).`;
    const expected = `
  DATA results TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA garden_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA temp1 LIKE results.
    CLEAR temp1.
  LOOP AT garden_rows INTO DATA(row).
    DATA seed TYPE i.
    seed = 0.
    DATA temp2 LIKE sy-index.
    temp2 = sy-index.
    WHILE seed <= 1.
      sy-index = temp2.
      APPEND row && seed TO temp1.
      seed = seed + 1.
    ENDWHILE.
ENDLOOP.
    results = temp1.`;
    testFix(abap, expected);
  });

  it("SWITCH, voided target", async () => {
    const abap = `
  DATA temp3 TYPE voided.
  DATA row TYPE string.
  temp3 = SWITCH #( row
    WHEN 'R' THEN 'radishes'
    WHEN 'V' THEN 'violets' ).`;
    const expected = `
  DATA temp3 TYPE voided.
  DATA row TYPE string.
  DATA temp1 LIKE temp3.
  CASE row.
    WHEN 'R'.
      temp1 = 'radishes'.
    WHEN 'V'.
      temp1 = 'violets'.
  ENDCASE.
  temp3 = temp1.`;
    testFix(abap, expected);
  });

  it("double FOR, remember LET", async () => {
    const abap = `
  DATA results TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA garden_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  results = VALUE #(
    FOR row IN garden_rows
    FOR seed = 0 WHILE seed <= 1
    LET offset = 2 IN
    ( row && offset ) ).`;
    const expected = `
  DATA results TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA garden_rows TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA temp1 LIKE results.
    CLEAR temp1.
  LOOP AT garden_rows INTO DATA(row).
    DATA seed TYPE i.
    seed = 0.
    DATA temp2 LIKE sy-index.
    temp2 = sy-index.
    WHILE seed <= 1.
      sy-index = temp2.
    DATA offset TYPE i.
    offset = 2.
      APPEND row && offset TO temp1.
      seed = seed + 1.
    ENDWHILE.
ENDLOOP.
    results = temp1.`;
    testFix(abap, expected);
  });

  it("VALUE, LINES OF", async () => {
    const abap = `
  DATA index TYPE i.
  DATA tab1 TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA tab2 TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  tab2 = VALUE #( ( LINES OF tab1 TO index ) ).`;
    const expected = `
  DATA index TYPE i.
  DATA tab1 TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA tab2 TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA temp1 LIKE tab2.
  CLEAR temp1.
  APPEND LINES OF tab1 TO index TO temp1.
  tab2 = temp1.`;
    testFix(abap, expected);
  });

  it("target, table expression, with key", async () => {
    const abap = `
TYPES: BEGIN OF ty_row,
         letter  TYPE string,
         is_seen TYPE abap_bool,
       END OF ty_row.
DATA seen_letters TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
seen_letters[ letter = 'A' ]-is_seen = abap_true.`;
    const expected = `
TYPES: BEGIN OF ty_row,
         letter  TYPE string,
         is_seen TYPE abap_bool,
       END OF ty_row.
DATA seen_letters TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
FIELD-SYMBOLS <temp1> LIKE LINE OF seen_letters.
DATA temp2 LIKE sy-tabix.
temp2 = sy-tabix.
READ TABLE seen_letters WITH KEY letter = 'A' ASSIGNING <temp1>.
sy-tabix = temp2.
IF sy-subrc <> 0.
  RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
ENDIF.
<temp1>-is_seen = abap_true.`;
    testFix(abap, expected);
  });

  it("SWITCH, inferred char, outline DATA()", async () => {
    const abap = `
  DATA bottle TYPE i.
  DATA(left) = SWITCH #( bottle
    WHEN 0 THEN 'bottle'
    WHEN 1 THEN 'no more bottles' ).`;
    const expected = `
  DATA bottle TYPE i.
  DATA left TYPE c LENGTH 6.
  left = SWITCH #( bottle
    WHEN 0 THEN 'bottle'
    WHEN 1 THEN 'no more bottles' ).`;
    testFix(abap, expected);
  });

  it("COND, inferred char, outline DATA()", async () => {
    const abap = `
    data bottle type i.
    data(what_to_take_down) = cond #( when bottle > 1 then 'one' else 'it' ).`;
    const expected = `
    data bottle type i.
    DATA what_to_take_down TYPE c LENGTH 3.
    what_to_take_down = cond #( when bottle > 1 then 'one' else 'it' ).`;
    testFix(abap, expected);
  });

  it("COND, inferred, simple", async () => {
    const abap = `
    data bottle type i.
    DATA what_to_take_down TYPE c LENGTH 3.
    what_to_take_down = cond #( when bottle > 1 then 'one' else 'it' ).`;
    const expected = `
    data bottle type i.
    DATA what_to_take_down TYPE c LENGTH 3.
    DATA temp1 LIKE what_to_take_down.
    IF bottle > 1.
      temp1 = 'one'.
    ELSE.
      temp1 = 'it'.
    ENDIF.
    what_to_take_down = temp1.`;
    testFix(abap, expected);
  });

  it("REDUCE, should init var", async () => {
    const abap = `
  DATA result TYPE i.
  result = REDUCE i(
      INIT s = 0
      FOR i = 2 UNTIL i > 4
      NEXT s = s + i ).`;
    const expected = `
  DATA result TYPE i.
  DATA temp1 TYPE i.
  DATA(s) = 0.
  DATA i TYPE i.
  i = 2.
  DATA temp2 LIKE sy-index.
  temp2 = sy-index.
  WHILE NOT i > 4.
    sy-index = temp2.
    s = s + i.
    i = i + 1.
  ENDWHILE.
  temp1 = s.
  result = temp1.`;
    testFix(abap, expected);
  });

  it("CONV with calculation", async () => {
    const abap = `
DATA: BEGIN OF ls_time,
        hours   TYPE i,
        minutes TYPE i,
      END OF ls_time.
DATA rv_time TYPE i.
rv_time = CONV decfloat34( frac( ( ls_time-hours * 60 + ls_time-minutes ) / 1440 ) ) * 1440.`;
    const expected = `
DATA: BEGIN OF ls_time,
        hours   TYPE i,
        minutes TYPE i,
      END OF ls_time.
DATA rv_time TYPE i.
DATA temp1 TYPE decfloat34.
temp1 = frac( ( ls_time-hours * 60 + ls_time-minutes ) / 1440 ).
rv_time = temp1 * 1440.`;
    testFix(abap, expected);
  });

  it("REDUCE with WHERE", async () => {
    const abap = `
TYPES: BEGIN OF ty_letter_value,
  letter(1) TYPE c,
  value     TYPE i,
END OF ty_letter_value.
DATA letter_values TYPE TABLE OF ty_letter_value.
DATA char_list    TYPE TABLE OF c.
DATA result TYPE i.
result = REDUCE i(
  INIT x = 0
  FOR letter_value IN letter_values
  FOR char IN char_list WHERE ( table_line = letter_value-letter )
  NEXT x = x + letter_value-value ).`;
    const expected = `
TYPES: BEGIN OF ty_letter_value,
  letter(1) TYPE c,
  value     TYPE i,
END OF ty_letter_value.
DATA letter_values TYPE TABLE OF ty_letter_value.
DATA char_list    TYPE TABLE OF c.
DATA result TYPE i.
DATA temp1 TYPE i.
DATA(x) = 0.
LOOP AT letter_values INTO DATA(letter_value).
LOOP AT char_list INTO DATA(char) WHERE ( table_line = letter_value-letter ).
  x = x + letter_value-value.
ENDLOOP.
ENDLOOP.
temp1 = x.
result = temp1.`;
    testFix(abap, expected);
  });

  it("method conditional", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo RETURNING VALUE(result) TYPE abap_bool.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    IF foo( ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo RETURNING VALUE(result) TYPE abap_bool.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
    IF foo( ) IS NOT INITIAL.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("COND without ELSE should CLEAR", async () => {
    const abap = `
    DATA int TYPE i.
    int = COND #( WHEN 10 <> 20 THEN 1 ).`;
    const expected = `
    DATA int TYPE i.
    DATA temp1 TYPE i.
    IF 10 <> 20.
      temp1 = 1.
    ELSE.
      CLEAR temp1.
    ENDIF.
    int = temp1.`;
    testFix(abap, expected);
  });

  it("table expression with key specified", async () => {
    const abap = `
    TYPES:
      BEGIN OF cipher_dict_struct,
        plain  TYPE c LENGTH 1,
        cipher TYPE c LENGTH 1,
      END OF cipher_dict_struct.
    DATA
      cipher_dict TYPE HASHED TABLE OF cipher_dict_struct
        WITH UNIQUE KEY plain
        WITH UNIQUE HASHED KEY cipher_key COMPONENTS cipher.
    DATA foo TYPE c LENGTH 1.
    foo = cipher_dict[ KEY cipher_key cipher = '' ]-plain.`;
    const expected = `
    TYPES:
      BEGIN OF cipher_dict_struct,
        plain  TYPE c LENGTH 1,
        cipher TYPE c LENGTH 1,
      END OF cipher_dict_struct.
    DATA
      cipher_dict TYPE HASHED TABLE OF cipher_dict_struct
        WITH UNIQUE KEY plain
        WITH UNIQUE HASHED KEY cipher_key COMPONENTS cipher.
    DATA foo TYPE c LENGTH 1.
    DATA temp1 LIKE LINE OF cipher_dict.
    DATA temp2 LIKE sy-tabix.
    temp2 = sy-tabix.
    READ TABLE cipher_dict WITH TABLE KEY cipher_key COMPONENTS cipher = '' INTO temp1.
    sy-tabix = temp2.
    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
    ENDIF.
    foo = temp1-plain.`;
    testFix(abap, expected);
  });

  it("REDUCE, str should be TYPE string", async () => {
    const abap = `
DATA result TYPE string.
result = REDUCE string(
           INIT str TYPE string
           FOR i = 0 UNTIL i = 5
           NEXT str = |sdf| ).`;
    const expected = `
DATA result TYPE string.
DATA temp1 TYPE string.
DATA str TYPE string.
DATA i TYPE i.
i = 0.
DATA temp2 LIKE sy-index.
temp2 = sy-index.
WHILE NOT i = 5.
  sy-index = temp2.
  str = |sdf|.
  i = i + 1.
ENDWHILE.
temp1 = str.
result = temp1.`;
    testFix(abap, expected);
  });

  it("FOR, negative increment", async () => {
    const abap = `
  DATA count TYPE i.
  DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  result = VALUE #(
    FOR i = count THEN i - 1 WHILE i GT 5
    ( |dsf| )
    ( || ) ).`;
    const expected = `
  DATA count TYPE i.
  DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA temp1 LIKE result.
  CLEAR temp1.
  DATA i TYPE i.
  i = count.
  DATA temp2 LIKE sy-index.
  temp2 = sy-index.
  WHILE i GT 5.
    sy-index = temp2.
    APPEND |dsf| TO temp1.
    APPEND || TO temp1.
    i = i - 1.
  ENDWHILE.
  result = temp1.`;
    testFix(abap, expected);
  });

  it("FOR, should not change sy-index", async () => {
    const abap = `
    DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    result = VALUE #(
      FOR i = 0 WHILE i < 2
      ( |{ sy-index }| )
      ( || ) ).`;
    const expected = `
    DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA temp1 LIKE result.
    CLEAR temp1.
    DATA i TYPE i.
    i = 0.
    DATA temp2 LIKE sy-index.
    temp2 = sy-index.
    WHILE i < 2.
      sy-index = temp2.
      APPEND |{ sy-index }| TO temp1.
      APPEND || TO temp1.
      i = i + 1.
    ENDWHILE.
    result = temp1.`;
    testFix(abap, expected);
  });

  it("Typed CONV", async () => {
    const abap = `TYPES type_e_letter TYPE c LENGTH 1.
TYPES type_t_letter TYPE STANDARD TABLE OF type_e_letter WITH NON-UNIQUE DEFAULT KEY.
DATA rt_letter TYPE type_t_letter.
INSERT CONV #( 'a' ) INTO TABLE rt_letter.`;
    const expected = `TYPES type_e_letter TYPE c LENGTH 1.
TYPES type_t_letter TYPE STANDARD TABLE OF type_e_letter WITH NON-UNIQUE DEFAULT KEY.
DATA rt_letter TYPE type_t_letter.
DATA temp1 TYPE type_e_letter.
temp1 = 'a'.
INSERT temp1 INTO TABLE rt_letter.`;
    testFix(abap, expected);
  });

  it("VALUE with BASE", async () => {
    const abap = `
  DATA result TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  APPEND 1 TO result.
  result = VALUE #( BASE result ( 5 ) ).`;
    const expected = `
  DATA result TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  APPEND 1 TO result.
  DATA temp1 LIKE result.
  CLEAR temp1.
  temp1 = result.
  APPEND 5 TO temp1.
  result = temp1.`;
    testFix(abap, expected);
  });

  it("FIND, RESULTS inline", async () => {
    const abap = `
    FIND ALL OCCURRENCES OF REGEX 'abc' IN 'sdf' RESULTS DATA(result_table).`;
    const expected = `
    DATA result_table TYPE match_result_tab.
    FIND ALL OCCURRENCES OF REGEX 'abc' IN 'sdf' RESULTS result_table.`;
    testFix(abap, expected);
  });

  it("CAST, infer", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS m IMPORTING foo TYPE REF TO lcl_bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD m.
    DATA var TYPE REF TO lcl_bar.
    m( CAST #( var ) ).
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS m IMPORTING foo TYPE REF TO lcl_bar.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD m.
    DATA var TYPE REF TO lcl_bar.
    DATA temp1 TYPE REF TO lcl_bar.
    temp1 ?= var.
    m( temp1 ).
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("ref variable name with CAST", async () => {
    const abap = `foo = CAST asdf( cl_abap_structdescr=>describe_by_data( ref ) ).`;
    const expected = `DATA temp1 TYPE REF TO asdf.
temp1 ?= cl_abap_structdescr=>describe_by_data( ref ).
foo = temp1.`;
    testFix(abap, expected);
  });

  it("structured ENUM", async () => {
    const abap = `
TYPES:
  BEGIN OF ENUM enum_formatting_option STRUCTURE formatting_option,
    no_formatting VALUE IS INITIAL,
    camel_case    VALUE 1,
  END OF ENUM enum_formatting_option STRUCTURE formatting_option.`;
    const expected = `
TYPES enum_formatting_option TYPE string.
CONSTANTS: BEGIN OF formatting_option,
             no_formatting TYPE enum_formatting_option VALUE IS INITIAL,
             camel_case TYPE enum_formatting_option VALUE 1,
           END OF formatting_option.`;
    testFix(abap, expected);
  });

  it("structured ENUM, no value defined", async () => {
    const abap = `
TYPES: BEGIN OF ENUM enum_type_info STRUCTURE type_info,
         string,
         numeric,
       END OF ENUM enum_type_info STRUCTURE type_info.`;
    const expected = `
TYPES enum_type_info TYPE string.
CONSTANTS: BEGIN OF type_info,
             string TYPE enum_type_info VALUE '1',
             numeric TYPE enum_type_info VALUE '2',
           END OF type_info.`;
    testFix(abap, expected);
  });

  it("SELECT, spaces within IN", async () => {
    const abap = `
  DATA ls_t000 TYPE t000.
  SELECT SINGLE * FROM t000 INTO ls_t000 WHERE cccategory IN ( 'S', 'C' ).`;
    const expected = `
  DATA ls_t000 TYPE t000.
  SELECT SINGLE * FROM t000 INTO ls_t000 WHERE cccategory IN ('S', 'C').`;
    testFix(abap, expected);
  });

  it("COND, typing", async () => {
    const abap = `
TYPES: BEGIN OF ty_abap_value_mapping,
         target_type TYPE string,
       END OF ty_abap_value_mapping.
DATA abap_value_mapping TYPE ty_abap_value_mapping.
DATA foo TYPE i.
DATA(type) = COND #(
  WHEN foo IS NOT INITIAL
  THEN abap_value_mapping-target_type
  ELSE 'bar' ).`;
    const expected = `
TYPES: BEGIN OF ty_abap_value_mapping,
         target_type TYPE string,
       END OF ty_abap_value_mapping.
DATA abap_value_mapping TYPE ty_abap_value_mapping.
DATA foo TYPE i.
DATA temp1 TYPE ty_abap_value_mapping-target_type.
IF foo IS NOT INITIAL.
  temp1 = abap_value_mapping-target_type.
ELSE.
  temp1 = 'bar'.
ENDIF.
DATA(type) = temp1.`;
    testFix(abap, expected);
  });

  it("COND, typing, with type in interface", async () => {
    const abap = `
INTERFACE lif.
  TYPES: BEGIN OF ty_abap_value_mapping,
           target_type TYPE string,
         END OF ty_abap_value_mapping.
ENDINTERFACE.

DATA abap_value_mapping TYPE lif=>ty_abap_value_mapping.
DATA foo TYPE i.
DATA(type) = COND #(
  WHEN foo IS NOT INITIAL
  THEN abap_value_mapping-target_type
  ELSE 'bar' ).`;
    const expected = `
INTERFACE lif.
  TYPES: BEGIN OF ty_abap_value_mapping,
           target_type TYPE string,
         END OF ty_abap_value_mapping.
ENDINTERFACE.

DATA abap_value_mapping TYPE lif=>ty_abap_value_mapping.
DATA foo TYPE i.
DATA type TYPE lif=>ty_abap_value_mapping-target_type.
type = COND #(
  WHEN foo IS NOT INITIAL
  THEN abap_value_mapping-target_type
  ELSE 'bar' ).`;
    testFix(abap, expected);
  });

  it("generic types should infer to non generic if possible", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF typefoo,
             field TYPE string,
             msgty TYPE c LENGTH 1,
           END OF typefoo.
    METHODS foo IMPORTING moo TYPE any.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA exp_message TYPE typefoo.
    foo( VALUE #( BASE exp_message msgty = 'E' ) ).
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF typefoo,
             field TYPE string,
             msgty TYPE c LENGTH 1,
           END OF typefoo.
    METHODS foo IMPORTING moo TYPE any.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA exp_message TYPE typefoo.
    DATA temp1 TYPE lcl=>typefoo.
    CLEAR temp1.
    temp1 = exp_message.
    temp1-msgty = 'E'.
    foo( temp1 ).
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("should downport to qualified type name, not basic type", async () => {
    const abap = `
INTERFACE lif.
  TYPES type TYPE i.
ENDINTERFACE.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS get RETURNING VALUE(result) TYPE lif=>type.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
    DATA(sdfs) = get( ).
    WRITE result.
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
INTERFACE lif.
  TYPES type TYPE i.
ENDINTERFACE.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS get RETURNING VALUE(result) TYPE lif=>type.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
    DATA sdfs TYPE lif=>type.
    sdfs = get( ).
    WRITE result.
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("MESSAGE WITH non simple source", async () => {
    const abap = `
  DATA name_of_constant TYPE string.
  DATA name_of_source TYPE string.
  MESSAGE e000(aa) WITH name_of_source && '=>' && name_of_constant.`;
    const expected = `
  DATA name_of_constant TYPE string.
  DATA name_of_source TYPE string.
  DATA(temp1) = name_of_source && '=>' && name_of_constant.
  MESSAGE e000(aa) WITH temp1.`;
    testFix(abap, expected);
  });

  it("Inline with NEW, must outline", async () => {
    const abap = `DATA(foobar) = NEW zcl_foobar( ).`;
    const expected = `DATA temp1 TYPE REF TO zcl_foobar.
CREATE OBJECT temp1 TYPE zcl_foobar.
DATA(foobar) = temp1.`;
    testFix(abap, expected);
  });

  it("READ with key VALUE infer", async () => {
    const abap = `
TYPES: BEGIN OF bar,
         name1 TYPE string,
         name2 TYPE string,
       END OF bar.
TYPES: BEGIN OF foo,
         keyname TYPE bar,
       END OF foo.
DATA result TYPE STANDARD TABLE OF foo WITH DEFAULT KEY.
READ TABLE result WITH KEY keyname = VALUE #( name1 = 'sdfs' name2 = 'sdfsd' ) TRANSPORTING NO FIELDS.`;
    const expected = `
TYPES: BEGIN OF bar,
         name1 TYPE string,
         name2 TYPE string,
       END OF bar.
TYPES: BEGIN OF foo,
         keyname TYPE bar,
       END OF foo.
DATA result TYPE STANDARD TABLE OF foo WITH DEFAULT KEY.
DATA temp1 TYPE bar.
CLEAR temp1.
temp1-name1 = 'sdfs'.
temp1-name2 = 'sdfsd'.
READ TABLE result WITH KEY keyname = temp1 TRANSPORTING NO FIELDS.`;
    testFix(abap, expected);
  });

  it("infer type, concat", async () => {
    const abap = `
TYPES: BEGIN OF ty_bar,
         name TYPE string,
       END OF ty_bar.
DATA name_of_constant TYPE string.
DATA s_foo TYPE ty_bar.
DATA(fullname_of_component) = name_of_constant && '-' && s_foo-name.`;
    const expected = `
TYPES: BEGIN OF ty_bar,
         name TYPE string,
       END OF ty_bar.
DATA name_of_constant TYPE string.
DATA s_foo TYPE ty_bar.
DATA fullname_of_component TYPE string.
fullname_of_component = name_of_constant && '-' && s_foo-name.`;
    testFix(abap, expected);
  });

  it("infer type, VALUE # REF TO", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE REF TO lcl.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    foo( VALUE #( ) ).
  ENDMETHOD.
ENDCLASS.`;
    const expected = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE REF TO lcl.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA temp1 TYPE REF TO lcl.
    CLEAR temp1.
    foo( temp1 ).
  ENDMETHOD.
ENDCLASS.`;
    testFix(abap, expected);
  });

  it("REDUCE, init multiple vars", async () => {
    const abap = `
DATA result TYPE i.
result = REDUCE i(
    INIT first = 0 second = 5
    FOR i = 2 UNTIL i > 4
    NEXT
    first = first + i
    second = 2 ).`;
    const expected = `
DATA result TYPE i.
DATA temp1 TYPE i.
DATA(first) = 0.
DATA(second) = 5.
DATA i TYPE i.
i = 2.
DATA temp2 LIKE sy-index.
temp2 = sy-index.
WHILE NOT i > 4.
  sy-index = temp2.
  first = first + i.
  second = 2.
  i = i + 1.
ENDWHILE.
temp1 = first.
result = temp1.`;
    testFix(abap, expected);
  });

  it("REDUCE with LET", async () => {
    const abap = `
DATA text TYPE string.
text = REDUCE #(
  LET txt_len = strlen( |dfsdfs| ) IN
  INIT foo = ||
  FOR i = 1 UNTIL i > txt_len
  NEXT foo = foo && |sdf| ).`;
    const expected = `
DATA text TYPE string.
DATA temp1 TYPE string.
DATA txt_len TYPE i.
txt_len = strlen( |dfsdfs| ).
DATA(foo) = ||.
DATA i TYPE i.
i = 1.
DATA temp2 LIKE sy-index.
temp2 = sy-index.
WHILE NOT i > txt_len.
  sy-index = temp2.
  foo = foo && |sdf|.
  i = i + 1.
ENDWHILE.
temp1 = foo.
text = temp1.`;
    testFix(abap, expected);
  });

  it("VALUE with LET + FOR", async () => {
    const abap = `
DATA result TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
result = VALUE #(
  LET lv_start = 2 + 2 IN
  FOR i = lv_start UNTIL i > lv_start * 2
  ( lv_start ) ).`;
    const expected = `
DATA result TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA temp1 LIKE result.
CLEAR temp1.
DATA(lv_start) = 2 + 2.
DATA i TYPE i.
i = lv_start.
DATA temp2 LIKE sy-index.
temp2 = sy-index.
WHILE NOT i > lv_start * 2.
  sy-index = temp2.
  APPEND lv_start TO temp1.
  i = i + 1.
ENDWHILE.
result = temp1.`;
    testFix(abap, expected);
  });

  it("INSERT internal, non simple", async () => {
    const abap = `
DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
INSERT |sdfsd| INTO TABLE result.`;
    const expected = `
DATA result TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
DATA temp1 LIKE LINE OF result.
temp1 = |sdfsd|.
INSERT temp1 INTO TABLE result.`;
    testFix(abap, expected);
  });

  it("REF, simple, inferred", async () => {
    const abap = `
DATA ref TYPE REF TO string.
DATA lv_string TYPE string.
ref = REF #( lv_string ).`;
    const expected = `
DATA ref TYPE REF TO string.
DATA lv_string TYPE string.
GET REFERENCE OF lv_string INTO ref.`;
    testFix(abap, expected);
  });

  it("REF, in method call, inferred", async () => {
    const abap = `
serialize_json( iv_data          = REF #( iv_data )
                iv_compress_json = iv_compress_json ).`;
    const expected = `
DATA(temp1) = REF #( iv_data ).
serialize_json( iv_data          = temp1
                iv_compress_json = iv_compress_json ).`;
    testFix(abap, expected);
  });

  it("REF, simple, inline", async () => {
    const abap = `DATA(temp1) = REF #( iv_data ).`;
    const expected = `GET REFERENCE OF iv_data INTO DATA(temp1).`;
    testFix(abap, expected);
  });

  it("GET REFERINCE INTO inline", async () => {
    const abap = `GET REFERENCE OF iv_data INTO DATA(temp1).`;
    const expected = `DATA temp1 LIKE REF TO iv_data.
GET REFERENCE OF iv_data INTO temp1.`;
    testFix(abap, expected);
  });

  it("CALL FUNCTION, not simple", async () => {
    const abap = `
CALL FUNCTION 'SCMS_BASE64_ENCODE_STR'
  EXPORTING
    input  = cl_ujt_utility=>string2xstring( lv_json )
  IMPORTING
    output = lv_string.`;
    const expected = `
DATA(temp1) = cl_ujt_utility=>string2xstring( lv_json ).
CALL FUNCTION 'SCMS_BASE64_ENCODE_STR'
  EXPORTING
    input  = temp1
  IMPORTING
    output = lv_string.`;
    testFix(abap, expected);
  });

  it("CALL FUNCTION, not simple, second parameter", async () => {
    const abap = `
CALL FUNCTION 'SCMS_BASE64_ENCODE_STR'
  EXPORTING
    foo    = sdfs
    input  = cl_ujt_utility=>string2xstring( lv_json )
  IMPORTING
    output = lv_string.`;
    const expected = `
DATA(temp1) = cl_ujt_utility=>string2xstring( lv_json ).
CALL FUNCTION 'SCMS_BASE64_ENCODE_STR'
  EXPORTING
    foo    = sdfs
    input  = temp1
  IMPORTING
    output = lv_string.`;
    testFix(abap, expected);
  });

  it("predicate function, matches()", async () => {
    const abap = `
  IF matches( val = 'foo' regex = 'foo' ).
    WRITE / 'yes'.
  ENDIF.`;
    const expected = `
  IF boolc( matches( val = 'foo' regex = 'foo' ) ) = abap_true.
    WRITE / 'yes'.
  ENDIF.`;
    testFix(abap, expected);
  });

  it("superflous VALUE #", async () => {
    const abap = `
TYPES: BEGIN OF ty,
         msgno TYPE i,
       END OF ty.
DATA message_table TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA(message_entry) = VALUE #( message_table[ msgno = 124 ] ).`;
    const expected = `
TYPES: BEGIN OF ty,
         msgno TYPE i,
       END OF ty.
DATA message_table TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA temp1 TYPE ty.
CLEAR temp1.
temp1 = message_table[ msgno = 124 ].
DATA(message_entry) = temp1.`;
    testFix(abap, expected);
  });

  it("VALUE table expression, optional", async () => {
    const abap = `
  DATA lt_prime_numbers TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA input TYPE i.
  DATA result TYPE i.
  result = VALUE i( lt_prime_numbers[ input ] OPTIONAL ).`;
    const expected = `
  DATA lt_prime_numbers TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  DATA input TYPE i.
  DATA result TYPE i.
  DATA temp1 TYPE i.
  CLEAR temp1.
  READ TABLE lt_prime_numbers INTO DATA(temp2) INDEX input.
  IF sy-subrc = 0.
    temp1 = temp2.
  ENDIF.
  result = temp1.`;
    testFix(abap, expected);
  });

  it("VALUE table expression, optional, another", async () => {
    const abap = `
TYPES: BEGIN OF ty_row,
         ext TYPE i,
         int TYPE i,
       END OF ty_row.
DATA table TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA foo TYPE i.
foo = VALUE #( table[ ext = 2 ]-int OPTIONAL ).`;
    const expected = `
TYPES: BEGIN OF ty_row,
         ext TYPE i,
         int TYPE i,
       END OF ty_row.
DATA table TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA foo TYPE i.
DATA temp1 TYPE i.
CLEAR temp1.
READ TABLE table INTO DATA(temp2) WITH KEY ext = 2.
IF sy-subrc = 0.
  temp1 = temp2-int.
ENDIF.
foo = temp1.`;
    testFix(abap, expected);
  });

  it("SQL, INTO field list", async () => {
    const abap = `
SELECT SINGLE foo, bar INTO (@ls_result-foo, @ls_result-bar)
  FROM zfoobar
  WHERE field = @ls_result-field.`;
    const expected = `
SELECT SINGLE foo bar INTO (ls_result-foo, ls_result-bar)
  FROM zfoobar
  WHERE field = ls_result-field.`;
    testFix(abap, expected);
  });

  it("APPEND INITIAL data reference inline, simple", async () => {
    const abap = `
DATA combined_data TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
APPEND INITIAL LINE TO combined_data REFERENCE INTO DATA(combined_values).`;
    const expected = `
DATA combined_data TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA combined_values TYPE REF TO i.
APPEND INITIAL LINE TO combined_data REFERENCE INTO combined_values.`;
    testFix(abap, expected);
  });

  it("APPEND INITIAL data reference inline, structured", async () => {
    const abap = `
TYPES: BEGIN OF ty,
         foo TYPE i,
       END OF ty.
DATA combined_data TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
APPEND INITIAL LINE TO combined_data REFERENCE INTO DATA(combined_values).`;
    const expected = `
TYPES: BEGIN OF ty,
         foo TYPE i,
       END OF ty.
DATA combined_data TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA combined_values TYPE REF TO ty.
APPEND INITIAL LINE TO combined_data REFERENCE INTO combined_values.`;
    testFix(abap, expected);
  });

  it("LOOP AT GROUP BY", async () => {
    const abap = `
TYPES: BEGIN OF initial_numbers_type,
         group  TYPE group,
         number TYPE i,
       END OF initial_numbers_type.
DATA initial_numbers TYPE STANDARD TABLE OF initial_numbers_type WITH DEFAULT KEY.
LOOP AT initial_numbers REFERENCE INTO DATA(initial_number)
    GROUP BY ( key = initial_number->group  count = GROUP SIZE )
    ASCENDING
    REFERENCE INTO DATA(group_key).
  WRITE / group_key->count.
  LOOP AT GROUP group_key REFERENCE INTO DATA(group_item).
    WRITE / group_key->count.
  ENDLOOP.
  WRITE / group_key->count.
ENDLOOP.`;
    const expected = `
TYPES: BEGIN OF initial_numbers_type,
         group  TYPE group,
         number TYPE i,
       END OF initial_numbers_type.
DATA initial_numbers TYPE STANDARD TABLE OF initial_numbers_type WITH DEFAULT KEY.
TYPES: BEGIN OF group_keytype,
         key TYPE initial_numbers_type-group,
         count TYPE i,
         items LIKE initial_numbers,
       END OF group_keytype.
DATA group_keytab TYPE STANDARD TABLE OF group_keytype WITH DEFAULT KEY.
DATA temp1 LIKE LINE OF group_keytab.
LOOP AT initial_numbers REFERENCE INTO DATA(initial_number).
READ TABLE group_keytab ASSIGNING FIELD-SYMBOL(<temp2>) WITH KEY key = initial_number->group.
IF sy-subrc = 0.
  <temp2>-count = <temp2>-count + 1.
  INSERT initial_number->* INTO TABLE <temp2>-items.
ELSE.
  temp1-key = initial_number->group.
  temp1-count = 1.
  INSERT initial_number->* INTO TABLE temp1-items.
  INSERT temp1 INTO TABLE group_keytab.
ENDIF.
ENDLOOP.
LOOP AT group_keytab REFERENCE INTO DATA(group_key).
  WRITE / group_key->count.
  LOOP AT group_key->items REFERENCE INTO DATA(group_item).
    WRITE / group_key->count.
  ENDLOOP.
  WRITE / group_key->count.
ENDLOOP.`;
    testFix(abap, expected);
  });

});
