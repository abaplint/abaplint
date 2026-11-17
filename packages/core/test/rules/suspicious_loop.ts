import {expect} from "chai";
import {MemoryFile, Registry} from "../../src";
import {SuspiciousLoop, SuspiciousLoopConf} from "../../src/rules";
import {testRule} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix} from "./_redundant_code";

const tests: IRedundantTest[] = [
  // condition never written in the loop body
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  result = result + 1.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lt TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nWHILE lines( lt ) < 3.\n  put( ).\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < imp AND lv_i < lcl=>co.\n  result = result + 1.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  IF result > 3.\n    CONTINUE.\n  ENDIF.\n  result = result + 1.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  LOOP AT tab INTO DATA(x).\n    EXIT.\n  ENDLOOP.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_i TYPE i.\nDATA lv_j TYPE i.\nWHILE lv_i < 10.\n  lv_j = lv_j + 1.\nENDWHILE."), cnt: 1},
  // condition set to the same value in every iteration: the shape of abap2UI5 c4e9ac8
  {abap: inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  result = result + lo_x->get( ).\n  lo_x = ref->ref.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_done TYPE abap_bool.\nWHILE lv_done = abap_false.\n  put( ).\n  lv_done = abap_true.\nENDWHILE."), cnt: 1},
  {abap: inMethod("DATA lv_i TYPE i.\nDATA(lv_max) = imp.\nWHILE lv_i < 10.\n  result = result + 1.\n  lv_i = lv_max.\nENDWHILE."), cnt: 1},

  // the loop body changes the condition
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  lv_i = lv_i + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  ch( CHANGING c = lv_i ).\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  ex( IMPORTING e = lv_i ).\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lt TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nWHILE lines( lt ) < 3.\n  APPEND 1 TO lt.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nDATA lv_j TYPE i.\nWHILE lv_i < 10.\n  lv_i = lv_j.\n  lv_j = lv_j + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  result = result + lo_x->get( ).\n  lo_x = lo_x->ref.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  lo_x = lo_x->obj( ).\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  lo_x = obj( ).\nENDWHILE."), cnt: 0},
  // flag set in a nested block, or reset and set again
  {abap: inMethod("DATA lv_done TYPE abap_bool.\nWHILE lv_done = abap_false.\n  result = result + 1.\n  IF result > 3.\n    lv_done = abap_true.\n  ENDIF.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(lv_retry) = abap_true.\nWHILE lv_retry = abap_true.\n  lv_retry = abap_false.\n  IF get( ) = 1.\n    lv_retry = abap_true.\n  ENDIF.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_done TYPE abap_bool.\nWHILE lv_done = abap_false.\n  IF get( ) = 1.\n    CONTINUE.\n  ENDIF.\n  lv_done = abap_true.\nENDWHILE."), cnt: 0},
  // other data in the source, which the loop body may change
  {abap: inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  put( ).\n  lo_x = ref->ref.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  ref = iref.\n  lo_x = ref->ref.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(lo_x) = ref.\nDATA(lo_list) = iref.\nWHILE lo_x IS BOUND.\n  lo_list->put( ).\n  lo_x = lo_list->ref.\nENDWHILE."), cnt: 0},
  // the loop body leaves the loop
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  IF get( ) = 1.\n    EXIT.\n  ENDIF.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  IF get( ) = 1.\n    RETURN.\n  ENDIF.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  RAISE EXCEPTION TYPE cx_static_check.\nENDWHILE."), cnt: 0},
  // conditions that can change unseen
  {abap: inMethod("WHILE sy-subrc = 0.\n  put( ).\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < get( ).\n  result = result + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("WHILE iref->attr < 10.\n  result = result + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("WHILE attr < 10.\n  put( ).\nENDWHILE."), cnt: 0},
  {abap: inMethod("WHILE attr < 10.\n  attr = attr + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("ASSIGN attr TO FIELD-SYMBOL(<lv>).\nWHILE <lv> < 10.\n  result = result + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nGET REFERENCE OF lv_i INTO DATA(lr).\nWHILE lv_i < 10.\n  lr->* = 10.\nENDWHILE."), cnt: 0},
  {abap: inMethod("WHILE abap_true = abap_true.\n  put( ).\nENDWHILE."), cnt: 0},
  // DO and syntax errors are not checked
  {abap: inMethod("DATA lv_i TYPE i.\nDO.\n  IF lv_i > 10.\n    EXIT.\n  ENDIF.\nENDDO."), cnt: 0},
  {abap: inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  unknown = 1.\nENDWHILE."), cnt: 0, syntaxError: true},
];

testRule(tests, SuspiciousLoop);
testSyntaxAfterFix(tests, SuspiciousLoop);

describe("Rule: suspicious_loop", () => {
  function run(abap: string, conf?: SuspiciousLoopConf) {
    const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
    const rule = new SuspiciousLoop();
    if (conf) {
      rule.setConfig(conf);
    }
    return rule.initialize(reg).run(reg.getFirstObject()!);
  }

  it("message and position, never written", () => {
    const issues = run(inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\n  result = result + 1.\nENDWHILE."));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(
      "WHILE condition never changes, the loop body does not write lv_i, the loop runs zero times or forever");
    expect(issues[0].getStart().getRow()).to.equal(50);
  });

  it("message, same value in every iteration", () => {
    const issues = run(inMethod("DATA(lo_x) = ref.\nWHILE lo_x IS BOUND.\n  result = result + lo_x->get( ).\n  lo_x = ref->ref.\nENDWHILE."));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("WHILE condition does not change after the first iteration, "
      + "the loop body sets lo_x to the same value in every iteration, the loop runs once or forever");
  });

  it("option unchangedCondition off", () => {
    const conf = new SuspiciousLoopConf();
    conf.unchangedCondition = false;
    expect(run(inMethod("DATA lv_i TYPE i.\nWHILE lv_i < 10.\nENDWHILE."), conf).length).to.equal(0);
  });
});
