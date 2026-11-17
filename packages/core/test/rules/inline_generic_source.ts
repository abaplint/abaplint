import {expect} from "chai";
import {InlineGenericSource} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {testRule, testRuleFix} from "./_utils";

function method(typing: string, body: string): string {
  return `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS m ${typing}.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD m.
${body}
  ENDMETHOD.
ENDCLASS.`;
}

const tests = [
  {abap: "parser error.", cnt: 0},

  // generic parameter or field symbol as the whole source
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = iv.`), cnt: 1, fix: true},
  {abap: method("IMPORTING iv TYPE csequence", `    DATA(lv) = iv.`), cnt: 1, fix: true},
  {abap: method("IMPORTING iv TYPE xsequence", `    DATA(lv) = iv.`), cnt: 1, fix: true},
  {abap: method("IMPORTING iv TYPE clike", `    FINAL(lv) = iv.`), cnt: 1, fix: true},
  {abap: method("CHANGING cv TYPE csequence", `    DATA(lv) = cv.`), cnt: 1},
  {abap: method("EXPORTING ev TYPE clike", `    DATA(lv) = ev.`), cnt: 1},
  {abap: method("IMPORTING iv TYPE clike iv2 TYPE csequence", `    DATA(lv) = iv.
    DATA(lv2) = iv2.`), cnt: 2},
  {abap: `FIELD-SYMBOLS <fs> TYPE csequence.
DATA(lv) = <fs>.`, cnt: 1, fix: true},
  {abap: method("IMPORTING iv TYPE clike", `    ASSIGN iv TO FIELD-SYMBOL(<fs>).
    DATA(lv) = <fs>.`), cnt: 1},
  {abap: `FORM foo USING p TYPE clike.
  DATA(lv) = p.
ENDFORM.`, cnt: 1},

  // the type is fixed deliberately, or the variable is declared
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = CONV string( iv ).`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    FINAL(lv) = CONV string( iv ).`), cnt: 0},
  {abap: method("IMPORTING iv TYPE xsequence", `    DATA(lv) = CONV xstring( iv ).`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    DATA lv TYPE string.
    lv = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = iv ##TYPE.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = iv ##type.`), cnt: 0},

  // fully typed sources
  {abap: method("IMPORTING iv TYPE string", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE c", `    DATA lv_c TYPE c LENGTH 10.
    DATA(lv) = lv_c.`), cnt: 0},
  {abap: method("IMPORTING it TYPE string_table", `    DATA(lt) = it.
    LOOP AT it INTO DATA(lv).
    ENDLOOP.
    READ TABLE it INTO DATA(lv2) INDEX 1.`), cnt: 0},
  {abap: `FIELD-SYMBOLS <fs> TYPE string.
DATA(lv) = <fs>.`, cnt: 0},

  // the source is not just the generic operand
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = iv && |x|.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = |{ iv }|.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = iv+1(2).`), cnt: 0},
  {abap: method("IMPORTING iv TYPE clike", `    DATA(lv) = strlen( iv ).`), cnt: 0},

  // generic types the system does not make concrete are a syntax error, check_syntax reports them
  {abap: method("IMPORTING iv TYPE any", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE data", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE simple", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE c", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE n", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE x", `    DATA(lv) = iv.`), cnt: 0},
  // the system makes these concrete with a warning, check_syntax reports them as an error today
  {abap: method("IMPORTING iv TYPE numeric", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE decfloat", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE p", `    DATA(lv) = iv.`), cnt: 0},
  {abap: method("IMPORTING iv TYPE REF TO data", `    DATA(lv) = iv->*.`), cnt: 0},
  {abap: method("IMPORTING it TYPE ANY TABLE", `    DATA(lt) = it.`), cnt: 0},

  // not an assignment
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS m EXPORTING ev TYPE clike.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD m.
    m( IMPORTING ev = DATA(lv) ).
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
];

testRule(tests, InlineGenericSource);

const fixes = [
  {
    input: method("IMPORTING iv TYPE clike", `    DATA(lv) = iv.`),
    output: method("IMPORTING iv TYPE clike", `    DATA(lv) = CONV string( iv ).`),
  },
  {
    input: method("IMPORTING iv TYPE csequence", `    FINAL(lv) = iv.`),
    output: method("IMPORTING iv TYPE csequence", `    FINAL(lv) = CONV string( iv ).`),
  },
  {
    input: method("IMPORTING iv TYPE xsequence", `    DATA(lv) = iv.`),
    output: method("IMPORTING iv TYPE xsequence", `    DATA(lv) = CONV xstring( iv ).`),
  },
  {
    input: `FIELD-SYMBOLS <fs> TYPE clike.
DATA(lv) = <fs>.`,
    output: `FIELD-SYMBOLS <fs> TYPE clike.
DATA(lv) = CONV string( <fs> ).`,
  },
];

testRuleFix(fixes, InlineGenericSource);

describe("Rule inline_generic_source, message and position", () => {
  it("names the fixed type, the generic type and the variable", () => {
    const abap = method("IMPORTING url TYPE clike", `    DATA(lv_url) = url.`);
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new InlineGenericSource().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(
      `The fixed type STRING is used for the generic type CLIKE of "url", declare "lv_url" with a type or use CONV`);
    expect(issues[0].getStart().getRow()).to.equal(7);
    expect(issues[0].getStart().getCol()).to.equal(10);
  });
});
