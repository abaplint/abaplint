import "../typings/index.d.ts";
import * as chai from "chai";
import * as Combi from "../src/combi";
import * as Reuse from "../src/statements/reuse";
import {File} from "../src/file";
import Runner from "../src/runner";

let expect = chai.expect;

let tests = [
  {c: "cs_tstcp",                         r: new Reuse.FieldChain(),      e: true},
  {c: "cs_tstcp-param",                   r: new Reuse.FieldChain(),      e: true},
  {c: "cs_tstcp-param(sy)",               r: new Reuse.FieldChain(),      e: true},
  {c: "cs_tstcp-param(sy-fdpos)",         r: new Reuse.FieldChain(),      e: true},
  {c: "cs_tstcp(sy-fdpos)",               r: new Reuse.FieldChain(),      e: true},
  {c: "foobar(3)",                        r: new Reuse.FieldChain(),      e: true},
  {c: "(sy)",                             r: new Reuse.FieldLength(),     e: true},
  {c: "(42)",                             r: new Reuse.FieldLength(),     e: true},
  {c: "(sy-fdpos)",                       r: new Reuse.FieldLength(),     e: true},
  {c: "+sy-fdpos",                        r: new Reuse.FieldOffset(),     e: true},
  {c: " ( lv_offset + 1 ) MOD 8",         r: new Reuse.Source(),          e: true},
  {c: "go_stream->remaining( )",          r: new Reuse.Source(),          e: true},
  {c: "xstrlen( foo ) - remaining( )",    r: new Reuse.Source(),          e: true},
  {c: "xstrlen( foo ) - str->rema( )",    r: new Reuse.Source(),          e: true},
  {c: "foobar(3)",                        r: new Reuse.Target(),          e: true},
  {c: "method( foo )-stream->rema( )",    r: new Reuse.MethodCallChain(), e: true},
  {c: "method( foo )->rema( )",           r: new Reuse.MethodCallChain(), e: true},
  {c: "method( )",                        r: new Reuse.MethodCall(),      e: true},
  {c: "method #( )",                      r: new Reuse.MethodCall(),      e: false},
  {c: "method asdf( )",                   r: new Reuse.MethodCall(),      e: false},
  {c: "method a( )",                      r: new Reuse.MethodCall(),      e: false},
  {c: "method ( )",                       r: new Reuse.MethodCall(),      e: false},
  {c: "TYPE abap_bool DEFAULT abap_true", r: new Reuse.Type(),            e: true},
  {c: "TYPE lcl_perce_repo=>ty_sum_tt",   r: new Reuse.Type(),            e: true},
  {c: "TYPE STANDARD TABLE",              r: new Reuse.TypeTable(),       e: true},
];

describe("Test reuse matchers", () => {
  tests.forEach((test) => {
    let not = "";
    if (test.e === false) {
      not = "not ";
    }
    it(test.c + " should " + not + "match " + test.r.getName(), () => {
      let file = Runner.parse([new File("temp.abap", test.c)])[0];
      let match = Combi.Combi.run(test.r.get_runnable(), file.getTokens());
      expect(match !== undefined).to.equals(test.e);
    });
  });
});