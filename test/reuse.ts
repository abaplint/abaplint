import "../typings/index.d.ts";
import * as chai from "chai";
import * as Combi from "../src/combi";
import Reuse from "../src/statements/reuse";
import {File} from "../src/file";
import Runner from "../src/runner";

let expect = chai.expect;

let tests = [
  {c: "cs_tstcp",                         r: Reuse.field_chain(),       e: true},
  {c: "cs_tstcp-param",                   r: Reuse.field_chain(),       e: true},
  {c: "cs_tstcp-param(sy)",               r: Reuse.field_chain(),       e: true},
  {c: "cs_tstcp-param(sy-fdpos)",         r: Reuse.field_chain(),       e: true},
  {c: "cs_tstcp(sy-fdpos)",               r: Reuse.field_chain(),       e: true},
  {c: "foobar(3)",                        r: Reuse.field_chain(),       e: true},
  {c: "(sy)",                             r: Reuse.field_length(),      e: true},
  {c: "(42)",                             r: Reuse.field_length(),      e: true},
  {c: "(sy-fdpos)",                       r: Reuse.field_length(),      e: true},
  {c: "+sy-fdpos",                        r: Reuse.field_offset(),      e: true},
  {c: " ( lv_offset + 1 ) MOD 8",         r: Reuse.source(),            e: true},
  {c: "go_stream->remaining( )",          r: Reuse.source(),            e: true},
  {c: "xstrlen( foo ) - remaining( )",    r: Reuse.source(),            e: true},
  {c: "xstrlen( foo ) - str->rema( )",    r: Reuse.source(),            e: true},
  {c: "foobar(3)",                        r: Reuse.target(),            e: true},
  {c: "method( foo )-stream->rema( )",    r: Reuse.method_call_chain(), e: true},
  {c: "method( foo )->rema( )",           r: Reuse.method_call_chain(), e: true},
  {c: "method( )",                        r: Reuse.method_call(),       e: true},
  {c: "method #( )",                      r: Reuse.method_call(),       e: false},
  {c: "method asdf( )",                   r: Reuse.method_call(),       e: false},
  {c: "method a( )",                      r: Reuse.method_call(),       e: false},
  {c: "method ( )",                       r: Reuse.method_call(),       e: false},
  {c: "TYPE abap_bool DEFAULT abap_true", r: Reuse.type(),              e: true},
  {c: "TYPE lcl_perce_repo=>ty_sum_tt",   r: Reuse.type(),              e: true},
  {c: "TYPE STANDARD TABLE",              r: Reuse.type_table(),        e: true},
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