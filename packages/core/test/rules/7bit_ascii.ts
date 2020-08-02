import {SevenBitAscii} from "../../src/rules/7bit_ascii";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'æøå'.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "", cnt: 0},
  {abap: "  ", cnt: 0},
];

testRule(tests, SevenBitAscii);