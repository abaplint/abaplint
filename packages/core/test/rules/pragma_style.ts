import {PragmaStyle} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: ".", cnt: 0},

// placement
  {abap: "##NO_TEXT.", cnt: 0},
  {abap: "DATA field ##NO_TEXT TYPE i.", cnt: 1},
  {abap: "DATA field TYPE i ##NO_TEXT.", cnt: 0},

// case
  {abap: "DATA eee.", cnt: 0},
  {abap: "DATA foo ##Needed.", cnt: 1},
  {abap: "DATA bar ##needed.", cnt: 1},
  {abap: "DATA sdf ##NEEDED.", cnt: 0},
];

testRule(tests, PragmaStyle);