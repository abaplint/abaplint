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
  {c: "foo(2)",                           r: new Reuse.Source(),          e: true},
  {c: "foobar(3)",                        r: new Reuse.Target(),          e: true},
  {c: "method( foo )-stream->rema( )",    r: new Reuse.MethodCallChain(), e: true},
  {c: "method( foo )->rema( )",           r: new Reuse.MethodCallChain(), e: true},
  {c: "method( )",                        r: new Reuse.MethodCall(),      e: true},
  {c: "method #( )",                      r: new Reuse.MethodCall(),      e: false},
  {c: "method asdf( )",                   r: new Reuse.MethodCall(),      e: false},
  {c: "method a( )",                      r: new Reuse.MethodCall(),      e: false},
  {c: "method ( )",                       r: new Reuse.MethodCall(),      e: false},
  {c: "foo(2)",                           r: new Reuse.MethodCall(),      e: false},
  {c: "TYPE abap_bool DEFAULT abap_true", r: new Reuse.Type(),            e: true},
  {c: "TYPE lcl_perce_repo=>ty_sum_tt",   r: new Reuse.Type(),            e: true},
  {c: "TYPE STANDARD TABLE",              r: new Reuse.TypeTable(),       e: true},
  {c: "22",                               r: new Reuse.Integer(),         e: true},
  {c: "22",                               r: new Reuse.Constant(),        e: true},
  {c: "22",                               r: new Reuse.Field(),           e: false},
  {c: "s_bar",                            r: new Reuse.Field(),           e: true},
  {c: "1250_data",                        r: new Reuse.Field(),           e: true},
  {c: "foo",                              r: new Reuse.Field(),           e: true},
  {c: "zquery",                           r: new Reuse.Field(),           e: true},
  {c: "_foobar",                          r: new Reuse.Field(),           e: true},
  {c: "-",                                r: new Reuse.Field(),           e: false},
  {c: "+",                                r: new Reuse.Field(),           e: false},
  {c: "*",                                r: new Reuse.Field(),           e: false},
  {c: "22",                               r: new Reuse.FieldChain(),      e: false},
  {c: "foobar",                           r: new Reuse.FieldChain(),      e: true},
  {c: "22foo",                            r: new Reuse.FieldChain(),      e: true},
  {c: "foo22",                            r: new Reuse.FieldChain(),      e: true},
  {c: "text-001",                         r: new Reuse.FieldChain(),      e: true},
  {c: "foo(2)",                           r: new Reuse.FieldChain(),      e: true},
  {c: "e070-trkorr",                      r: new Reuse.FieldSub(),        e: true},
  {c: "foo",                              r: new Reuse.FieldSub(),        e: true},
  {c: "s_trkorr",                         r: new Reuse.FieldSub(),        e: true},
  {c: "bar",                              r: new Reuse.FieldSub(),        e: true},
  {c: "-",                                r: new Reuse.FieldSub(),        e: false},
  {c: "foo type string",                  r: new Reuse.MethodParam(),     e: true},
  {c: "type string",                      r: new Reuse.Type(),            e: true},
  {c: "type string",                      r: new Reuse.TypeTable(),       e: false},
  {c: "type index table",                 r: new Reuse.Type(),            e: false},
  {c: "type index table",                 r: new Reuse.TypeTable(),       e: true},
//  {c: "<Z-BAR>",                          r: new Reuse.FieldSymbol(),     e: true},
];

describe("Test reuse matchers", () => {
  tests.forEach((test) => {
    let not = test.e === true ? "" : "not ";

    it("\"" + test.c + "\" should " + not + "match " + test.r.getName(), () => {
      let file = Runner.parse([new File("temp.abap", test.c)])[0];
      let match = Combi.Combi.run(test.r.get_runnable(), file.getTokens());
      expect(match !== undefined).to.equals(test.e);
    });
  });
});