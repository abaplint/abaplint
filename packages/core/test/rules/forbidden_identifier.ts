import {ForbiddenIdentifier, ForbiddenIdentifierConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests1 = [
  {abap: "parser error", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
];

testRule(tests1, ForbiddenIdentifier);

const tests2 = [
  {abap: "DATA let TYPE i.", cnt: 1},
  {abap: "DATA LET TYPE i.", cnt: 1},
  {abap: "DATA WRIte TYPE i.", cnt: 1},
  {abap: "WRITE bar.", cnt: 0},
];

const config = new ForbiddenIdentifierConf();
config.check = ["^let$", "^write$"];
testRule(tests2, ForbiddenIdentifier, config);