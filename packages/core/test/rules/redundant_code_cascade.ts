import {expect} from "chai";
import {MemoryFile, Registry} from "../../src";
import {IRule} from "../../src/rules/_irule";
import {AliasNeverReassigned, BooleanFlagViaIf, BoundCheckAfterCreate, CastViaGenericReference, ClearAfterDeclaration,
  ClearBeforeOverwrite, ConstantCondition, CopyChain, CopyOfInitialVariable, SingleUseExpressionTemp, TryCastEmptyCatch,
  UnnecessaryCopy} from "../../src/rules";
import {fixAll, inMethod} from "./_redundant_code";

// The rules applied one after the other, like abaplint --fix, reach a state without any issue

function all(): IRule[] {
  // the order of abaplint --fix, ie. the order of the rule keys
  return [new AliasNeverReassigned(), new BooleanFlagViaIf(), new BoundCheckAfterCreate(),
    new CastViaGenericReference(), new ClearAfterDeclaration(), new ClearBeforeOverwrite(), new ConstantCondition(),
    new CopyChain(), new CopyOfInitialVariable(), new SingleUseExpressionTemp(), new TryCastEmptyCatch(),
    new UnnecessaryCopy()];
}

function cascade(input: string, expected: string, rules: IRule[]) {
  const result = fixAll(inMethod(input), rules);
  expect(result.code).to.equal(inMethod(expected));
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", result.code)).parse();
  for (const rule of all()) {
    expect(rule.initialize(reg).run(reg.getFirstObject()!).map(i => i.getKey())).to.deep.equal([]);
  }
  return result.rounds;
}

describe("redundant code rules, cascades", () => {
  it("clear_after_declaration, copy_of_initial_variable and copy_chain", () => {
    const rounds = cascade(`    DATA t26 TYPE REF TO lcl.
    DATA t27 TYPE REF TO lcl.
    CLEAR t27.
    t26 = t27.
    DATA t28 TYPE REF TO lcl.
    DATA t29 TYPE REF TO lcl.
    CLEAR t29.
    t29 = iref.
    t28 = t29.
    put( o = t26 ).
    ref = t28.`, `    DATA t26 TYPE REF TO lcl.
    DATA t29 TYPE REF TO lcl.
    t29 = iref.
    put( o = t26 ).
    ref = t29.`, [new ClearAfterDeclaration(), new CopyOfInitialVariable(), new CopyChain()]);
    expect(rounds).to.be.greaterThan(2);
  });

  it("constant condition with copies, generated code", () => {
    cascade(`    DATA t8 TYPE REF TO lcl.
    CLEAR t8.
    DATA t9 TYPE REF TO lcl.
    CLEAR t9.
    DATA(t10) = abap_true.
    IF t10 = abap_true.
      DATA(t11) = |Base|.
      t11 = t11 && |rule|.
      DATA(t12) = NEW lcl( ).
      t12->text = t11.
      t9 = t12.
    ELSE.
      DATA t13 TYPE REF TO lcl.
      CLEAR t13.
      t9 = t13.
    ENDIF.
    t8 = t9.
    ref = t8.`, `      DATA(t11) = |Base|.
      t11 = t11 && |rule|.
      DATA(t12) = NEW lcl( ).
      t12->text = t11.
    ref = t12.`, all());
  });

  it("boolean flag, copies and temporaries", () => {
    cascade(`    DATA(t433) = VALUE abap_bool( ).
    DATA(t434) = text.
    IF t434 IS INITIAL.
      t433 = abap_true.
    ENDIF.
    text = t433.`, `    text = xsdbool( text IS INITIAL ).`, all());
  });

  it("cast in TRY after CLEAR", () => {
    cascade(`    DATA t1 TYPE REF TO lsub.
    CLEAR t1.
    TRY.
        t1 ?= iref->ref.
      CATCH cx_sy_move_cast_error.
    ENDTRY.
    ref = t1.`, `    DATA t1 TYPE REF TO lsub.
    IF iref->ref IS INSTANCE OF lsub OR iref->ref IS INITIAL.
        t1 ?= iref->ref.
    ENDIF.
    ref = t1.`, all());
  });

  it("cast via a generic reference, then TRY with empty CATCH", () => {
    cascade(`    DATA t46 TYPE REF TO lsub.
    DATA t49 TYPE REF TO object.
    t49 = iref.
    TRY.
        t46 ?= t49.
      CATCH cx_sy_move_cast_error.
    ENDTRY.
    ref = t46.`, `    DATA t46 TYPE REF TO lsub.
    IF iref IS INSTANCE OF lsub OR iref IS INITIAL.
        t46 ?= iref.
    ENDIF.
    ref = t46.`, all());
  });

  it("CLEAR before overwrite in a loop, then copy chain", () => {
    cascade(`    DATA t137 TYPE string.
    DATA t125 TYPE string.
    t125 = text.
    DO 2 TIMES.
      CLEAR t137.
      t137 = t125.
      text = t137.
    ENDDO.`, `    DATA t125 TYPE string.
    t125 = text.
    DO 2 TIMES.
      text = t125.
    ENDDO.`, all());
  });

  it("bound checks after create, one after the other", () => {
    const rounds = cascade(`    DATA t1 TYPE REF TO lcl.
    CREATE OBJECT t1.
    IF t1 IS BOUND.
      t1->put( ).
    ENDIF.
    IF t1 IS BOUND.
      t1->put( ).
    ENDIF.`, `    DATA t1 TYPE REF TO lcl.
    CREATE OBJECT t1.
      t1->put( ).
      t1->put( ).`, all());
    expect(rounds).to.equal(2);
  });

  it("runtime array helper, aliases of a created object", () => {
    cascade(`    DATA t17 TYPE REF TO lcl.
    DATA t18 TYPE REF TO lcl.
    DATA t19 TYPE REF TO lcl.
    CREATE OBJECT t19.
    t18 = t19.
    DATA(t20) = t18.
    DATA(t21) = 1.
    t20->put( ).
    APPEND t21 TO t20->tab.
    t20->put( ).
    DATA(t24) = t18.
    t17 = t24.
    ref = t17.`, `    DATA t18 TYPE REF TO lcl.
    CREATE OBJECT t18.
    t18->put( ).
    APPEND 1 TO t18->tab.
    t18->put( ).
    ref = t18.`, all());
  });

  it("declared temporaries, generated code", () => {
    cascade(`    DATA t2 TYPE string.
    DATA t1 TYPE REF TO lcl.
    t2 = |abapdoc|.
    t1 = NEW lcl( s = t2 ).
    DATA t9 TYPE REF TO lcl.
    t9 = t1->ref.
    DATA t8 TYPE i.
    t8 = t9->get( ).
    DATA t5 TYPE abap_bool.
    DATA t6 TYPE abap_bool.
    t6 = xsdbool( t8 IS INITIAL ).
    t5 = t6.
    IF t5 = abap_true.
      attr = t8.
    ENDIF.
    put( o = t1 ).`, `    DATA t1 TYPE REF TO lcl.
    t1 = NEW lcl( s = |abapdoc| ).
    DATA t8 TYPE i.
    t8 = t1->ref->get( ).
    IF xsdbool( t8 IS INITIAL ) = abap_true.
      attr = t8.
    ENDIF.
    put( o = t1 ).`, all());
  });
});
