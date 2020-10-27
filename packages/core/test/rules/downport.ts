import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Downport} from "../../src/rules";
import {Config} from "../../src/config";
import {testRuleFixSingle} from "./_utils";
import {IConfiguration} from "../../src/_config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";

function buildConfig(): IConfiguration {
  const conf = Config.getDefault().get();
  conf.syntax.version = Version.v702;
  const conf702 = new Config(JSON.stringify(conf));
  return conf702;
}

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new Downport(), buildConfig());
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

  it("Use CREATE OBJECT instead of NEW", async () => {
    const issues = await findIssues("foo = NEW #( ).");
    expect(issues.length).to.equal(1);
  });

  it("quick fix, Use CREATE OBJECT instead of NEW", async () => {
    const abap = "foo = NEW #( ).";
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

  it("EMPTY KEY", async () => {
    const abap = `DATA tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.`;
    const expected = `DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.`;
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
  FIELD-SYMBOLS <lv_row> TYPE string.
LOOP AT lt_rows ASSIGNING <lv_row>.
  ENDLOOP.`;

    testFix(abap, expected);
  });

  it("CONV", async () => {
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

});
