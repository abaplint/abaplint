import {ShortCase} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: "CASE moo.\nENDCASE.", cnt: 1},
  {abap: "CASE moo.\nWHEN 'X'.\nENDCASE.", cnt: 1},
  {abap: "CASE moo.\nWHEN 'X' OR 'Y'.\nENDCASE.", cnt: 0},
  {abap: "CASE moo.\nWHEN OTHERS.\nENDCASE.", cnt: 1},
  {abap: "CASE moo.\nWHEN 'A'.\nWHEN 'B'.\nENDCASE.", cnt: 0},
  {abap: "CASE moo.\nWHEN 'A'.\nWHEN OTHERS.\nENDCASE.", cnt: 0},
];

testRule(tests, ShortCase);