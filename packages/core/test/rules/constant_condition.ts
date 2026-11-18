import {expect} from "chai";
import {MemoryFile, Registry, Version} from "../../src";
import {ConstantCondition} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testNested, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const ifElse = (c: string, cond: string) => inMethod(`DATA(c) = ${c}.
IF ${cond}.
  result = 1.
ELSE.
  result = 2.
ENDIF.`);

const exclusive = (body: string) => inMethod(`CONSTANTS c_num TYPE c LENGTH 1 VALUE 'N'.
CONSTANTS c_numeric TYPE c LENGTH 1 VALUE '%'.
CONSTANTS c_n2 TYPE c LENGTH 1 VALUE 'N'.
CONSTANTS c_long TYPE c LENGTH 2 VALUE 'ABC'.
CONSTANTS c_long2 TYPE c LENGTH 2 VALUE 'ABD'.
TYPES: BEGIN OF ty_row,
         kind TYPE c LENGTH 1,
       END OF ty_row.
DATA kind TYPE c LENGTH 1.
DATA str TYPE string.
DATA num TYPE n LENGTH 2.
DATA ls_row TYPE ty_row.
FIELD-SYMBOLS <row> TYPE ty_row.
CLEAR: kind, str, num, ls_row.
${body}`);

const tests: IRedundantTest[] = [
  // constant variable
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\n  result = 1.\nENDIF."), cnt: 1, fix: true},
  {abap: ifElse("abap_true", "c = abap_true"), cnt: 1, fix: true},
  {abap: ifElse("abap_false", "c = abap_true"), cnt: 1, fix: true},
  {abap: ifElse("abap_true", "c <> abap_true"), cnt: 1, fix: true},
  {abap: ifElse("abap_true", "c NE abap_false"), cnt: 1, fix: true},
  {abap: ifElse("abap_true", "c EQ 'X'"), cnt: 1, fix: true},
  {abap: ifElse("abap_true", "abap_true = c"), cnt: 1, fix: true},
  {abap: ifElse("abap_true", "NOT c = abap_true"), cnt: 1, fix: true},
  {abap: ifElse("abap_false", "c IS INITIAL"), cnt: 1, fix: true},
  {abap: ifElse("abap_false", "c IS NOT INITIAL"), cnt: 1, fix: true},
  {abap: ifElse("space", "NOT c IS INITIAL"), cnt: 1, fix: true},
  {abap: ifElse("'X'", "c = abap_true"), cnt: 1, fix: true},
  {abap: ifElse("'AB'", "c = 'AB '"), cnt: 1, fix: true},
  {abap: ifElse("abap_undefined", "c = abap_false"), cnt: 1, fix: true},
  {abap: inMethod("DATA(c) = abap_false.\nIF c = abap_true.\n  result = 1.\nENDIF.\nresult = 3."), cnt: 1, fix: true},
  // ELSEIF chains
  {abap: inMethod(`DATA(c) = abap_false.
IF c = abap_true.
  result = 1.
ELSEIF imp = 2.
  result = 2.
ELSE.
  result = 3.
ENDIF.`), cnt: 1, fix: true},
  {abap: inMethod(`DATA(c) = abap_true.
IF imp = 1.
  result = 1.
ELSEIF c = abap_true.
  result = 2.
ELSEIF imp = 3.
  result = 3.
ELSE.
  result = 4.
ENDIF.`), cnt: 1, fix: true},
  {abap: inMethod(`DATA(c) = abap_false.
IF imp = 1.
  result = 1.
ELSEIF c = abap_true.
  result = 2.
ELSE.
  result = 4.
ENDIF.`), cnt: 1, fix: true},
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\nELSE.\nENDIF."), cnt: 1, fix: true},
  // nested block and loop
  {abap: inMethod("DATA(c) = abap_true.\nIF imp = 1.\n  IF c = abap_true.\n    result = 1.\n  ENDIF.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA(c) = abap_true.\n  IF c = abap_true.\n    result = 1.\n  ENDIF.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DATA(c) = abap_true.\nDO 2 TIMES.\n  IF c = abap_true.\n    result = 1.\n  ENDIF.\nENDDO."), cnt: 1, fix: true},
  // declarations in the kept branch are still declared after the fix
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\n  DATA(x) = 1.\nENDIF.\nresult = x."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA t9 TYPE REF TO lcl.
    DATA(t10) = abap_true.
    IF t10 = abap_true.
      DATA(t12) = NEW lcl( ).
      t9 = t12.
    ELSE.
      DATA t13 TYPE REF TO lcl.
      CLEAR t13.
      t9 = t13.
    ENDIF.
    result = t9->get( ).`), cnt: 1, fix: true},

  // never changed variable
  {abap: inMethod("DATA r TYPE REF TO lcl.\nIF r IS BOUND.\n  result = 1.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCLEAR r.\nIF r IS NOT BOUND.\n  result = 1.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE i.\nIF v IS INITIAL.\n  result = 1.\nELSE.\n  result = 2.\nENDIF.\nresult = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE i.\nIF v IS NOT INITIAL.\n  result = 1.\nENDIF.\nIF v IS INITIAL.\n  result = 2.\nENDIF."), cnt: 2, fix: true},
  {abap: inMethod(`    DATA t31 TYPE REF TO lcl.
    DATA t32 TYPE REF TO lcl.
    CLEAR t32.
    IF t32 IS BOUND.
      t31 = t32.
    ENDIF.
    ref = t31.`), cnt: 1, fix: true},

  // written, or read elsewhere
  {abap: inMethod("DATA(c) = abap_true.\nc = abap_false.\nIF c = abap_true.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\nENDIF.\nresult = strlen( c )."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nch( CHANGING c = result ).\nIF c = abap_true.\nENDIF.\nIF c = abap_false.\nENDIF."), cnt: 0},
  // declaration not executed on every path
  {abap: inMethod("IF imp = 1.\n  DATA(c) = abap_true.\nENDIF.\nIF c = abap_true.\n  result = 1.\nENDIF."), cnt: 0},
  {abap: inMethod("DO imp TIMES.\n  DATA(c) = abap_true.\nENDDO.\nIF c = abap_true.\n  result = 1.\nENDIF."), cnt: 0},
  // not a constant, or not a supported condition
  {abap: inMethod("DATA(c) = abap_true.\nIF c = text.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = 1.\nIF c = 1.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = |X|.\nIF c = 'X'.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = `X`.\nIF c = 'X'.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true AND imp = 1.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nIF ( c = abap_true ).\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nIF c > abap_false.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nCHECK c = abap_true."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nWHILE c = abap_false.\nENDWHILE."), cnt: 0},
  // a removed branch declares data used after the IF
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\n  result = 1.\nELSE.\n  DATA(x) = 2.\nENDIF.\nresult = x."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_false.\nIF c = abap_true.\n  DATA x TYPE i.\nENDIF.\nresult = x."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_false.\nIF c = abap_true.\n  FIELD-SYMBOLS <f> TYPE i.\nENDIF.\nASSIGN attr TO <f>."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_false.\nIF c = abap_true.\n  TYPES ty TYPE i.\nENDIF.\nDATA y TYPE ty."), cnt: 0},
  // never changed DATA(v) = VALUE t( ).
  {abap: inMethod("DATA(v) = VALUE abap_bool( ).\nIF v IS INITIAL.\n  result = 1.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA(v) = VALUE i( ).\n  IF v IS NOT INITIAL.\n    result = 1.\n  ENDIF.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("TYPES ty_ref TYPE REF TO lcl.\nDATA(r) = VALUE ty_ref( ).\nIF r IS BOUND.\n  result = 1.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(v) = VALUE abap_bool( ).\nv = abap_true.\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA(v) = VALUE ty_tab( ( 1 ) ).\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  // never changed variable: VALUE, writes, address, CHANGING, attributes and parameters
  {abap: inMethod("DATA v TYPE i VALUE 1.\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nv = 1.\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA v TYPE c LENGTH 1.\nCLEAR v WITH 'X'.\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nch( CHANGING c = v ).\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nASSIGN v TO FIELD-SYMBOL(<fs>).\n<fs> = 1.\nIF v IS INITIAL.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nGET REFERENCE OF r INTO DATA(rr).\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nDATA(rr) = REF #( r ).\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nIF v = 0.\nENDIF."), cnt: 0},
  {abap: inMethod("IF ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("IF iref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = ref.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\nENDIF.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _if.\n  IF &1 = abap_true. ENDIF.\nEND-OF-DEFINITION.\n" + inMethod("DATA(c) = abap_true.\n_if c."), cnt: 0},
  {abap: inMethod("DATA(c) = abap_true.\nIF c = abap_true.\nENDIF.\nunknown = 1."), cnt: 0, syntaxError: true},

  // exclusive values: x <> a OR x <> b, x = a AND x = b
  {abap: exclusive("IF kind <> c_num OR kind <> c_numeric.\nENDIF."), cnt: 1},
  {abap: exclusive("IF kind = 'A' AND kind = 'B'.\nENDIF."), cnt: 1},
  {abap: exclusive("IF kind NE 'A' OR NOT kind EQ 'B'.\nENDIF."), cnt: 1},
  {abap: exclusive("IF kind = 'A' AND imp = 1 AND 'B' = kind.\nENDIF."), cnt: 1},
  {abap: exclusive("IF kind <> 'A' OR kind <> 'B' OR kind <> 'C'.\nENDIF."), cnt: 1},
  {abap: exclusive("IF ls_row-kind <> 'A' OR ls_row-kind <> 'B'.\nENDIF."), cnt: 1},
  {abap: exclusive("IF str <> 'A' OR str <> 'B'.\nENDIF."), cnt: 1},
  {abap: exclusive("ASSIGN ls_row TO <row>.\nIF <row>-kind <> 'A' OR <row>-kind <> 'B'.\nENDIF."), cnt: 1},
  {abap: exclusive("IF imp = 1 OR ( kind <> 'A' OR kind <> 'B' ).\nENDIF."), cnt: 1},
  {abap: exclusive("WHILE kind <> 'A' OR kind <> 'B'.\nENDWHILE."), cnt: 1},
  {abap: exclusive("CHECK kind <> 'A' OR kind <> 'B'."), cnt: 1},
  {abap: exclusive("DATA(b) = xsdbool( kind = 'A' AND kind = 'B' )."), cnt: 1},
  {abap: exclusive("IF kind <> 'A' OR kind <> 'B'.\nENDIF.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 1},
  {abap: exclusive("IF kind <> c_long OR kind <> 'AC'.\nENDIF."), cnt: 1},
  // not reported: same values, other operators, no known value, other types, calls, mixed AND and OR
  {abap: exclusive("IF kind <> c_num OR kind <> c_n2.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR kind <> 'A '.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> c_long OR kind <> c_long2.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind = 'A' OR kind = 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' AND kind <> 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind < 'A' OR kind > 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR ls_row-kind <> 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR kind <> str.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR kind <> |B|.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR kind <> `B`.\nENDIF."), cnt: 0},
  {abap: exclusive("IF num <> '1' OR num <> '01'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF imp <> 1 OR imp <> 2.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR kind <> 'B' AND imp = 1.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR imp = get( ) OR kind <> 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind <> 'A' OR ( imp = 1 OR kind <> 'B' ).\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind+0(1) <> 'A' OR kind+0(1) <> 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("ASSERT kind <> 'A' OR kind <> 'B'."), cnt: 0},
];

testRule(tests, ConstantCondition);
testSyntaxAfterFix(tests, ConstantCondition);

testRuleFix([
  {
    input: inMethod(`    DATA(c) = abap_true.
    IF c = abap_true.
      result = 1.
    ELSE.
      result = 2.
    ENDIF.`),
    output: inMethod(`      result = 1.`),
  },
  {
    input: inMethod(`    DATA(c) = abap_false.
    IF c = abap_true.
      result = 1.
    ELSE.
      result = 2.
    ENDIF.`),
    output: inMethod(`      result = 2.`),
  },
  {
    input: inMethod(`    DATA(c) = abap_false.
    IF c = abap_true.
      result = 1.
    ENDIF.
    result = 3.`),
    output: inMethod(`    result = 3.`),
  },
  {
    input: inMethod(`    DATA(c) = abap_false.
    IF c = abap_true.
      result = 1.
    ELSEIF imp = 2.
      result = 2.
    ELSE.
      result = 3.
    ENDIF.`),
    output: inMethod(`    IF imp = 2.
      result = 2.
    ELSE.
      result = 3.
    ENDIF.`),
  },
  {
    input: inMethod(`    DATA(c) = abap_true.
    IF imp = 1.
      result = 1.
    ELSEIF c = abap_true.
      result = 2.
    ELSEIF imp = 3.
      result = 3.
    ELSE.
      result = 4.
    ENDIF.`),
    output: inMethod(`    IF imp = 1.
      result = 1.
    ELSE.
      result = 2.
    ENDIF.`),
  },
  {
    input: inMethod(`    DATA(c) = abap_false.
    IF imp = 1.
      result = 1.
    ELSEIF c = abap_true.
      result = 2.
    ELSE.
      result = 4.
    ENDIF.`),
    output: inMethod(`    IF imp = 1.
      result = 1.
    ELSE.
      result = 4.
    ENDIF.`),
  },
  {
    input: inMethod(`    DATA r TYPE REF TO lcl.
    IF r IS BOUND.
      result = 1.
    ENDIF.
    result = 2.`),
    output: inMethod(`    DATA r TYPE REF TO lcl.
    result = 2.`),
  },
  {
    input: inMethod(`    DATA(c) = abap_true. IF c = abap_true. result = 1. ENDIF.`),
    output: inMethod(`      result = 1. `),
  },
], ConstantCondition);

testVersions(ifElse("abap_true", "c = abap_true"), ConstantCondition, [
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.v740sp02, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);

testNested(ConstantCondition, [
  {
    body: `    DATA(c1) = abap_true.
    IF c1 = abap_true.
      result = 1.
    ELSE.
      DATA(c2) = abap_false.
      IF c2 = abap_true.
        result = 2.
      ENDIF.
    ENDIF.`,
    issues: 2, fixes: 1,
    expected: `      result = 1.`,
  },
  {
    body: `    DATA(c1) = abap_true.
    IF c1 = abap_true.
      DATA(c2) = abap_false.
      IF c2 = abap_true.
        result = 2.
      ENDIF.
      result = 1.
    ENDIF.`,
    issues: 2, fixes: 1,
    expected: `      result = 1.`,
  },
  {
    body: `    DATA v TYPE i.
    IF v IS NOT INITIAL.
      result = 1.
    ELSEIF v IS INITIAL.
      result = 2.
    ENDIF.`,
    issues: 2, fixes: 1,
    expected: `    DATA v TYPE i.
      result = 2.`,
  },
]);

testRule([
  {abap: exclusive("IF kind <> 'A' OR kind <> 'B'.\nENDIF."), cnt: 0},
  {abap: exclusive("IF kind = 'A' AND kind = 'B'.\nENDIF."), cnt: 0},
], ConstantCondition, {exclusiveValues: false}, "constant_condition, exclusiveValues off");

describe("Rule: constant_condition, exclusiveValues message", () => {
  it("message and position", () => {
    const abap = exclusive("IF imp = 1 OR kind <> c_num OR kind <> c_numeric.\nENDIF.");
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new ConstantCondition().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Condition is always true, kind cannot be both c_num and c_numeric");
    expect(issues[0].getStart().getCol()).to.equal(15);
    expect(issues[0].getEnd().getCol()).to.equal(49);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
  });

  it("constants of a class and an interface", () => {
    const abap = `INTERFACE lif_kind.
  CONSTANTS: BEGIN OF kind,
               num     TYPE c LENGTH 1 VALUE 'N',
               numeric TYPE c LENGTH 1 VALUE '%',
             END OF kind.
ENDINTERFACE.
CLASS lcl_kind DEFINITION.
  PUBLIC SECTION.
    CONSTANTS c_num TYPE c LENGTH 1 VALUE 'N'.
    CONSTANTS c_numeric TYPE c LENGTH 1 VALUE '%'.
    CLASS-METHODS run IMPORTING kind TYPE c.
ENDCLASS.
CLASS lcl_kind IMPLEMENTATION.
  METHOD run.
    IF kind <> lcl_kind=>c_num OR kind <> lcl_kind=>c_numeric.
    ENDIF.
    IF kind <> lif_kind=>kind-num OR kind <> lif_kind=>kind-numeric.
    ENDIF.
    IF kind <> lif_kind=>kind-num OR kind <> lcl_kind=>c_num.
    ENDIF.
  ENDMETHOD.
ENDCLASS.`;
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new ConstantCondition().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.map(i => i.getStart().getRow())).to.deep.equal([15, 17]);
  });

  it("constants of an unknown class", () => {
    const abap = `FORM run USING kind TYPE c.
  IF kind <> cl_abap_typedescr=>typekind_num OR kind <> cl_abap_typedescr=>typekind_numeric.
  ENDIF.
ENDFORM.`;
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const issues = new ConstantCondition().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });
});
