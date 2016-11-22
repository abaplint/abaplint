import {Breakpoint} from "../../src/rules/breakpoint";
import {testRule} from "../utils";

let tests = [
  {abap: "break-point.", cnt: 1},
  {abap: "break user.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, "test breakpoint rule", Breakpoint);