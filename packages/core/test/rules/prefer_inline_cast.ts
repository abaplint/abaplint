import {expect} from "chai";
import {Config, MemoryFile, Registry, Version} from "../../src";
import {applyEditSingle} from "../../src/edit_helper";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {ABAPObject} from "../../src/objects/_abap_object";
import {PreferInlineCast} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const definitions = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA attr TYPE i.
    METHODS get RETURNING VALUE(result) TYPE REF TO lcl.
    METHODS run IMPORTING n TYPE i OPTIONAL.
    CLASS-METHODS take IMPORTING a TYPE i OPTIONAL p TYPE REF TO lcl b TYPE i OPTIONAL
      RETURNING VALUE(result) TYPE REF TO lcl.
    CLASS-METHODS any_take IMPORTING p TYPE any RETURNING VALUE(result) TYPE REF TO lcl.
    CLASS-METHODS object_take IMPORTING p TYPE REF TO object RETURNING VALUE(result) TYPE REF TO lcl.
    CLASS-METHODS unary IMPORTING p TYPE REF TO lcl RETURNING VALUE(result) TYPE REF TO lcl.
    CLASS-METHODS number RETURNING VALUE(result) TYPE i.
    CLASS-METHODS change CHANGING p TYPE REF TO lcl.
    CLASS-METHODS output EXPORTING p TYPE REF TO lcl.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
  METHOD run.
  ENDMETHOD.
  METHOD take.
  ENDMETHOD.
  METHOD any_take.
  ENDMETHOD.
  METHOD object_take.
  ENDMETHOD.
  METHOD unary.
  ENDMETHOD.
  METHOD number.
  ENDMETHOD.
  METHOD change.
  ENDMETHOD.
  METHOD output.
  ENDMETHOD.
ENDCLASS.
DATA object TYPE REF TO object.
DATA target TYPE REF TO lcl.
DATA number TYPE i.
`;
const declaration = "DATA(t) = CAST lcl( object ).";
const fixture = (body: string) => definitions + body;
const positives = [
  "target = t.",
  "number = t->attr.",
  "target = t->get( ).",
  "t->run( ).",
  "target = lcl=>take( p = t ).",
  "target = lcl=>take( a = number p = t b = 1 ).",
  "DATA(result) = t.",
  "DATA(result) = t->attr.",
  "DATA(result) = t->get( ).",
  "t->run( n = lcl=>number( ) ).", // CAST is the first evaluated operand
  "target = lcl=>any_take( p = t ).",
  "target = lcl=>object_take( p = t ).",
  "object = t.",
];
const tests: {abap: string, cnt: number, fix: boolean, syntaxError?: boolean}[] =
  positives.map(use => ({abap: fixture(declaration + "\n" + use), cnt: 1, fix: true}));
tests.push(
  {abap: "parser error.", cnt: 0, fix: false, syntaxError: true},
  {abap: fixture("DATA(t) = CAST missing( object ).\ntarget = t."), cnt: 0, fix: false, syntaxError: true},
  {abap: fixture("target = target."), cnt: 0, fix: false},
  {abap: fixture("INTERFACE lif.\nDATA attr TYPE i.\nENDINTERFACE.\nDATA(t) = CAST lif( object ).\nnumber = t->attr."), cnt: 1, fix: true},
  {abap: fixture("DATA(t) = CAST lcl( lcl=>take( p = target ) ).\ntarget = lcl=>take( p = t )."), cnt: 0, fix: false},
  {abap: fixture("DATA dref TYPE REF TO data.\nTYPES: BEGIN OF ty, c TYPE i, END OF ty.  DATA(t) = CAST ty( dref ).  number = t->c."), cnt: 0, fix: false},
  {abap: fixture("DATA dref TYPE REF TO data.\nDATA(t) = CAST i( dref ).\nnumber = t->*."), cnt: 0, fix: false},
  {abap: fixture("DATA(t) = CAST lcl( target ).\ntarget = t."), cnt: 1, fix: true},
  {abap: fixture(declaration + "\nDATA(u) = CAST lcl( t ).\ntarget = u."), cnt: 1, fix: true},
  {abap: fixture(declaration + "\nDATA(text) = |{ t->attr }|."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nSELECT SINGLE mandt FROM t000 INTO @DATA(client) WHERE mandt = @t->attr."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = lcl=>unary( t )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nCALL METHOD t->run."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nCALL METHOD lcl=>take EXPORTING p = t RECEIVING result = target."), cnt: 0, fix: false},
  {abap: fixture(`CLASS cx_static_check DEFINITION.
ENDCLASS.
CLASS cx_static_check IMPLEMENTATION.
ENDCLASS.
CLASS lcx DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    METHODS constructor IMPORTING p TYPE REF TO lcl.
ENDCLASS.
CLASS lcx IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.
${declaration}
RAISE EXCEPTION TYPE lcx EXPORTING p = t.`), cnt: 0, fix: false},
  {abap: fixture("DATA t TYPE REF TO lcl.\nt = CAST lcl( object ).\ntarget = t."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nnumber = 1.\ntarget = t."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = t.\nt->run( )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = t.\nCLEAR t."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = t.\nDATA other LIKE t."), cnt: 0, fix: false},
  // SyntaxLogic currently rejects the deliberately forward read in this loop fixture.
  {abap: fixture("DO 2 TIMES.\n  target = t.\n  " + declaration + "\n  target = t.\nENDDO."), cnt: 0, fix: false, syntaxError: true},
  {abap: fixture("DO 2 TIMES.\n  " + declaration + "\n  target = t.\nENDDO."), cnt: 1, fix: true},
  {abap: fixture(declaration + "\ntarget = t.\nDO 2 TIMES.\n  t->run( ).\nENDDO."), cnt: 0, fix: false},
  {abap: fixture("DO 2 TIMES.\n" + declaration + "\ntarget = t.\nt->run( ).\nENDDO."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = t.\nASSIGN t TO FIELD-SYMBOL(<ref>)."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = t.\nDATA(ref) = REF #( t )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nIF t IS INITIAL.\nENDIF."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nIF t IS BOUND.\nENDIF."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nDATA(bound) = xsdbool( t IS BOUND )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nASSIGN t TO FIELD-SYMBOL(<ref>)."), cnt: 0, fix: false},
  {abap: fixture("DATA ref TYPE REF TO data.\n" + declaration + "\nGET REFERENCE OF t INTO ref."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nDATA(ref) = REF #( t )."), cnt: 0, fix: false},
  {abap: fixture("FIELD-SYMBOLS <object> TYPE REF TO object.\nDATA(t) = CAST lcl( <object> ).\ntarget = t."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nlcl=>change( CHANGING p = t )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nlcl=>output( IMPORTING p = t )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = lcl=>take( EXPORTING p = t )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = lcl=>take( a = lcl=>number( ) p = t )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = lcl=>take( p = t b = lcl=>number( ) )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget = t->get( )->get( )."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nnumber = t->attr + 1."), cnt: 0, fix: false},
  {abap: fixture("DATA name TYPE string.\n" + declaration + "\nDATA(result) = t->(name)."), cnt: 0, fix: false},
  {abap: fixture("DATA name TYPE string.\n" + declaration + "\nt->(name)( )."), cnt: 0, fix: false},
  {abap: fixture("DATA name TYPE string.\n" + declaration + "\ntarget = t.\nASSIGN (name) TO FIELD-SYMBOL(<ref>)."), cnt: 0, fix: false},
  {abap: fixture("DEFINE macro.\n  target = &1.\nEND-OF-DEFINITION.\n" + declaration + "\nmacro t."), cnt: 0, fix: false},
  {abap: fixture("DEFINE macro.\n  target = t.\nEND-OF-DEFINITION.\n" + declaration + "\ntarget = t.\nmacro."), cnt: 0, fix: false},
  {abap: fixture("TRY.\n" + declaration + "\ntarget = t.\nCATCH cx_root.\ntarget = t.\nENDTRY."), cnt: 0, fix: false},
  {abap: fixture("TRY.\n" + declaration + "\ntarget = t.\nCLEANUP.\ntarget = t.\nENDTRY."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\n\" intervening comment\ntarget = t."), cnt: 0, fix: false},
  {abap: fixture("DATA(t) = CAST lcl( object ) ##NEEDED.\ntarget = t."), cnt: 0, fix: false},
  {abap: fixture("FIELD-SYMBOLS <ref> TYPE REF TO lcl.\n" + declaration + "\n<ref> = t."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nMOVE t TO target."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\ntarget ?= t."), cnt: 0, fix: false},
  {abap: fixture(declaration + "\nlcl=>take( p = t )."), cnt: 0, fix: false},
);

const swapping = `CLASS caller DEFINITION.
  PUBLIC SECTION.
    METHODS example.
    METHODS swap RETURNING VALUE(result) TYPE REF TO object.
    DATA mo TYPE REF TO lcl.
    DATA mv TYPE i.
ENDCLASS.
CLASS caller IMPLEMENTATION.
  METHOD swap.
    CLEAR mo.
  ENDMETHOD.
  METHOD example.
    DATA x TYPE REF TO lcl.
    DATA(t) = CAST lcl( swap( ) ). x = mo->take( a = mv p = t ).
  ENDMETHOD.
ENDCLASS.`;
tests.push({abap: fixture(swapping), cnt: 0, fix: false});
// Calls in the CAST operand remain safe when the helper is used as the receiver.
tests.push({abap: fixture(swapping.replace("x = mo->take( a = mv p = t ).", "x = t->get( ).")), cnt: 1, fix: true});
// Plain attribute chains in the CAST operand are safe even in the argument shape.
tests.push({abap: fixture(`CLASS holder DEFINITION.
  PUBLIC SECTION.
    DATA ref TYPE REF TO object.
ENDCLASS.
DATA holder TYPE REF TO holder.
DATA(t) = CAST lcl( holder->ref ).
target = lcl=>take( p = t ).`), cnt: 1, fix: true});

// Identical names in different methods must not contribute to each other's read count.
const methods = `CLASS scopes DEFINITION.
  PUBLIC SECTION.
    METHODS first.
    METHODS second.
ENDCLASS.
CLASS scopes IMPLEMENTATION.
  METHOD first.
    DATA object TYPE REF TO object.
    DATA target TYPE REF TO lcl.
    ${declaration}
    target = t.
  ENDMETHOD.
  METHOD second.
    DATA t TYPE REF TO lcl.
    t->run( ).
    t->run( ).
  ENDMETHOD.
ENDCLASS.`;
tests.push({abap: fixture(methods), cnt: 1, fix: true});
tests.push({abap: fixture("FORM example.\n" + declaration + "\ntarget = t.\nENDFORM."), cnt: 1, fix: true});

testRule(tests, PreferInlineCast);

testRuleFix(positives.map(use => ({
  input: fixture(declaration + "\n" + use),
  output: fixture("\n" + use.replace(/\bt\b/, "CAST lcl( object )")),
})), PreferInlineCast);
testRuleFix([
  {input: fixture(declaration + " target = t."), output: fixture(" target = CAST lcl( object ).")},
  {input: fixture("DATA(T) = CAST lcl( object ).\ntarget = t."), output: fixture("\ntarget = CAST lcl( object ).")},
  {input: fixture("DATA(t) = CAST lcl(\n object ).\ntarget = t."), output: fixture("\ntarget = CAST lcl(\nobject ).")},
], PreferInlineCast);

describe("prefer_inline_cast syntax and versions", () => {
  // Ensure negatives exercise the exclusion, rather than accidentally relying on syntax errors.
  it("fixtures have no syntax errors", () => {
    for (const test of tests) {
      if (test.syntaxError === true) {
        continue;
      }
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
      const syntax = new SyntaxLogic(reg, reg.getFirstObject()! as ABAPObject).run();
      expect(syntax.issues.map(i => i.getMessage()), test.abap).to.deep.equal([]);
    }
  });

  for (const version of [Version.v702, Version.v740sp02, Version.Cloud]) {
    it("version " + version, () => {
      const reg = new Registry(Config.getDefault(version))
        .addFile(new MemoryFile("zfoo.prog.abap", fixture(declaration + "\ntarget = t."))).parse();
      const issues = new PreferInlineCast().initialize(reg).run(reg.getFirstObject()!);
      expect(issues.length).to.equal(version === Version.v702 ? 0 : 1);
    });
  }

  it("fixed fixtures still pass syntax", () => {
    for (const test of tests.filter(t => t.fix)) {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
      const issues = new PreferInlineCast().initialize(reg).run(reg.getFirstObject()!);
      expect(issues.length, test.abap).to.equal(test.cnt);
      for (const issue of [...issues].reverse()) {
        applyEditSingle(reg, issue.getDefaultFix()!);
      }
      reg.parse();
      const syntax = new SyntaxLogic(reg, reg.getFirstObject()! as ABAPObject).run();
      expect(syntax.issues.map(i => i.getMessage()), test.abap).to.deep.equal([]);
    }
  });
});
