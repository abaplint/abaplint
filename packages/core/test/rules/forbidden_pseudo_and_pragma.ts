import {ForbiddenPseudoAndPragma, ForbiddenPseudoAndPragmaConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests1 = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
];

testRule(tests1, ForbiddenPseudoAndPragma);

const tests2 = [
  {abap: "DATA pragma TYPE datum ##NO_TEXT.", cnt: 1},
  {abap: "TYPES forbidden_foo TYPE datum.", cnt: 0},
  {abap: "ri_html->add( '</td>' ). \"#EC NOTEXT", cnt: 1},
  {abap: "ri_html->add( '</td>' ).", cnt: 0},
  {abap: `*"* definitions, interfaces or type declarations) you need for`, cnt: 0},
];

const config = new ForbiddenPseudoAndPragmaConf();
config.pragmas = ["##NO_TEXT"];
config.pseudo = [`"#EC NOTEXT`];
testRule(tests2, ForbiddenPseudoAndPragma, config);