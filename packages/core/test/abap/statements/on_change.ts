import {getStatements, statementType, statementVersionFail} from "../_utils";
import {expect} from "chai";
import {Source, Target} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ON CHANGE OF structure-field.",
  "ON CHANGE OF gt_tab-field1 OR gt_tab-field2.",
];

statementType(tests, "ON CHANGE", Statements.OnChange);

const versionsFail = [
  {abap: `ON CHANGE OF structure-field.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ON CHANGE");

it("ON CHANGE reads every operand", () => {
  const node = getStatements("ON CHANGE OF first OR second.")[0];
  expect(node.findDirectExpressions(Source).map(s => s.concatTokens())).to.deep.equal(["first", "second"]);
  expect(node.findDirectExpressions(Target)).to.have.length(0);
});
