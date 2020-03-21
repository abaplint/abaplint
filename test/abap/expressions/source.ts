import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import * as Expressions from "../../../src/abap/2_statements/expressions";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";

const tests = [
  {c: " ( lv_offset + 1 ) MOD 8",         r: new Expressions.Source(),          e: true},
  {c: "go_stream->remaining( )",          r: new Expressions.Source(),          e: true},
  {c: "xstrlen( foo ) - remaining( )",    r: new Expressions.Source(),          e: true},
  {c: "xstrlen( foo ) - str->rema( )",    r: new Expressions.Source(),          e: true},
  {c: "foo(2)",                           r: new Expressions.Source(),          e: true},
  {c: "VALUE #( )",                       r: new Expressions.Source(),          e: true},
  {c: "VALUE #( VALUE #( ) )",            r: new Expressions.Source(),          e: true},
  {c: "VALUE #( foo = VALUE #( ) )",      r: new Expressions.Source(),          e: true},
  {c: "value #( ( foo = 1 bar = 2 boo = value #( ( value #( ( moo = 3 loo = 4 ) ) ) ) ) )", r: new Expressions.Source(), e: true},
  {c: `value #(
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4 foo = 1 bar = 2 boo = 3 moo = 4
    )`, r: new Expressions.Source(), e: true},
  {c: `VALUE #(
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) ) ( VALUE #( ) )
    )`, r: new Expressions.Source(), e: true},
  {c: `VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #(
    VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #(
    VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #(
    VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #(
    VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #(
    VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #(
    VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( VALUE #( ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) )
    ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) )
    ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) ) )`, r: new Expressions.Source(), e: true},
  {c: `VALUE #(
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 ) ( foo = 1 bar = 2 moo = 3 )
    )`, r: new Expressions.Source(), e: true},
];

describe("Test expression matchers", () => {
  tests.forEach((test) => {
    const not = test.e === true ? "" : "not ";

    it("\"" + test.c + "\" should " + not + "match " + test.r.getName(), () => {
      const tokens = getTokens(test.c);
      const match = Combi.Combi.run(test.r.getRunnable(), tokens, Config.getDefault().getVersion());
      expect(match !== undefined).to.equals(test.e);
    });
  });
});