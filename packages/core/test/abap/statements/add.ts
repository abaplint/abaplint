import {getStatements, statementType} from "../_utils";
import {expect} from "chai";
import {Source, Target} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "add 2 to lv_foo.",
  "add 2 to\n lv_foo.",
  "add 2 to\r\n lv_foo.",
  "add zcl_class=>c_diagonal to lo_foo->mode.",
  "ADD sdf-dsf THEN sdf-dsf UNTIL sdf-dsf GIVING sdf-sdf.",
  `ADD sdfsd THEN sdfsd UNTIL sdfsd TO sdfds.`,
  `ADD foo THEN foo UNTIL foo GIVING foo ACCORDING TO foo.`,
  `ADD <ledger>-tsl01 THEN <ledger>-tsl02 UNTIL <ledger>-tsl16
    ACCORDING TO lo=>pos
    GIVING gs-vas.`,
];

statementType(tests, "ADD", Statements.Add);

it("ADD reads the range and writes GIVING", () => {
  const node = getStatements("ADD first THEN second UNTIL last GIVING result.")[0];
  expect(node.findDirectExpressions(Source).map(s => s.concatTokens())).to.deep.equal(["first", "second", "last"]);
  expect(node.findDirectExpressions(Target).map(t => t.concatTokens())).to.deep.equal(["result"]);
});
