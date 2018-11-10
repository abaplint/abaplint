import {expect} from "chai";
import * as Combi from "../../../src/abap/combi";
import * as Expressions from "../../../src/abap/expressions";
import {getTokens} from "../_utils";

// todo, refactor to separate files, one for each expression

let tests = [
  {c: "cs_tstcp",                         r: new Expressions.FieldChain(),      e: true},
  {c: "cs_tstcp-param",                   r: new Expressions.FieldChain(),      e: true},
  {c: "cs_tstcp-param(sy)",               r: new Expressions.FieldChain(),      e: true},
  {c: "cs_tstcp-param(sy-fdpos)",         r: new Expressions.FieldChain(),      e: true},
  {c: "cs_tstcp(sy-fdpos)",               r: new Expressions.FieldChain(),      e: true},
  {c: "foobar(3)",                        r: new Expressions.FieldChain(),      e: true},
  {c: "(sy)",                             r: new Expressions.FieldLength(),     e: true},
  {c: "(42)",                             r: new Expressions.FieldLength(),     e: true},
  {c: "(sy-fdpos)",                       r: new Expressions.FieldLength(),     e: true},
  {c: "+sy-fdpos",                        r: new Expressions.FieldOffset(),     e: true},
  {c: " ( lv_offset + 1 ) MOD 8",         r: new Expressions.Source(),          e: true},
  {c: "go_stream->remaining( )",          r: new Expressions.Source(),          e: true},
  {c: "xstrlen( foo ) - remaining( )",    r: new Expressions.Source(),          e: true},
  {c: "xstrlen( foo ) - str->rema( )",    r: new Expressions.Source(),          e: true},
  {c: "foo(2)",                           r: new Expressions.Source(),          e: true},
  {c: "foobar(3)",                        r: new Expressions.Target(),          e: true},
  {c: "method( foo )-stream->rema( )",    r: new Expressions.MethodCallChain(), e: true},
  {c: "method( foo )->rema( )",           r: new Expressions.MethodCallChain(), e: true},
  {c: "method( )",                        r: new Expressions.MethodCall(),      e: true},
  {c: "method #( )",                      r: new Expressions.MethodCall(),      e: false},
  {c: "method asdf( )",                   r: new Expressions.MethodCall(),      e: false},
  {c: "method a( )",                      r: new Expressions.MethodCall(),      e: false},
  {c: "method ( )",                       r: new Expressions.MethodCall(),      e: false},
  {c: "foo(2)",                           r: new Expressions.MethodCall(),      e: false},
  {c: "TYPE abap_bool DEFAULT abap_true", r: new Expressions.Type(),            e: true},
  {c: "TYPE lcl_perce_repo=>ty_sum_tt",   r: new Expressions.Type(),            e: true},
  {c: "TYPE STANDARD TABLE",              r: new Expressions.TypeTable(),       e: true},
  {c: "22",                               r: new Expressions.Integer(),         e: true},
  {c: "22",                               r: new Expressions.Constant(),        e: true},
  {c: "22",                               r: new Expressions.Field(),           e: false},
  {c: "s_bar",                            r: new Expressions.Field(),           e: true},
  {c: "1250_data",                        r: new Expressions.Field(),           e: true},
  {c: "foo",                              r: new Expressions.Field(),           e: true},
  {c: "zquery",                           r: new Expressions.Field(),           e: true},
  {c: "_foobar",                          r: new Expressions.Field(),           e: true},
  {c: "%bar",                             r: new Expressions.Field(),           e: true},
  {c: "%bar%",                            r: new Expressions.Field(),           e: true},
  {c: "-",                                r: new Expressions.Field(),           e: false},
  {c: "+",                                r: new Expressions.Field(),           e: false},
  {c: "*",                                r: new Expressions.Field(),           e: false},
  {c: "22",                               r: new Expressions.FieldChain(),      e: false},
  {c: "foobar",                           r: new Expressions.FieldChain(),      e: true},
  {c: "22foo",                            r: new Expressions.FieldChain(),      e: true},
  {c: "foo22",                            r: new Expressions.FieldChain(),      e: true},
  {c: "text-001",                         r: new Expressions.FieldChain(),      e: true},
  {c: "foo(2)",                           r: new Expressions.FieldChain(),      e: true},
  {c: "e070-trkorr",                      r: new Expressions.FieldSub(),        e: true},
  {c: "foo",                              r: new Expressions.FieldSub(),        e: true},
  {c: "s_trkorr",                         r: new Expressions.FieldSub(),        e: true},
  {c: "bar",                              r: new Expressions.FieldSub(),        e: true},
  {c: "-",                                r: new Expressions.FieldSub(),        e: false},
  {c: "foo type string",                  r: new Expressions.MethodParam(),     e: true},
  {c: "type string",                      r: new Expressions.Type(),            e: true},
  {c: "type string",                      r: new Expressions.TypeTable(),       e: false},
  {c: "type index table",                 r: new Expressions.Type(),            e: false},
  {c: "type index table",                 r: new Expressions.TypeTable(),       e: true},
  {c: "type index table",                 r: new Expressions.TypeTable(),       e: true},
  {c: "%_C_POINTER",                      r: new Expressions.TypeName(),        e: true},
//  {c: "<Z-BAR>",                          r: new Expressions.FieldSymbol(),     e: true},
];

describe("Test expression matchers", () => {
  tests.forEach((test) => {
    let not = test.e === true ? "" : "not ";

    it("\"" + test.c + "\" should " + not + "match " + test.r.getName(), () => {
      let tokens = getTokens(test.c);
      let match = Combi.Combi.run(test.r.getRunnable(), tokens);
      expect(match !== undefined).to.equals(test.e);
    });
  });
});