import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SELECT-OPTIONS s_trkorr FOR e070-trkorr.",
  "SELECT-OPTIONS s_trkorr FOR e070-trkorr OBLIGATORY.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar MEMORY ID zfoo.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar NO-EXTENSION.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar NO-EXTENSION NO INTERVALS.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar NO INTERVALS MEMORY ID zfoo.",
  "SELECT-OPTIONS s_icon FOR icon-name DEFAULT 'foo' OPTION CP.",
];

statementType(tests, "SELECT-OPTIONS", Statements.SelectOption);