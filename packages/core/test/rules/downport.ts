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

describe("Rule: downport, basics", () => {

  it("parser error", async () => {
    const issues = await findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("all okay, pass along", async () => {
    const issues = await findIssues("WRITE bar.");
    expect(issues.length).to.equal(0);
  });

});

describe("Rule: NEW", () => {

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

START-OF-SELECTION.
  DATA str TYPE string.
  str = to_lower( NEW lcl_bar( )->m( ) ).`;

    const expected = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS m RETURNING VALUE(val) TYPE string.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD m.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA str TYPE string.
  DATA temp1 TYPE REF TO lcl_bar.
CREATE OBJECT temp1 TYPE lcl_bar.
str = to_lower( temp1->m( ) ).`;

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

  it("downport, returning table, global type definition", async () => {
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

  it("downport, returning table, type part of class definition", async () => {
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

});
