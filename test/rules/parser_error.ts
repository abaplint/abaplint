import {ParserError} from "../../src/rules/parser_error";
import {testRule} from "../utils";

let tests = [
  {abap: "blah blah.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "##EXISTS\nENDMETHOD.", cnt: 0},
];

testRule(tests, "test parser_error rule", ParserError);