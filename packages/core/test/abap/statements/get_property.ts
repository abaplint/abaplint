import {getStatements, statementType, statementVersionFail} from "../_utils";
import {expect} from "chai";
import {Source, Target} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH.",
  "GET PROPERTY OF io_app_obj 'Charts' = lv_charts.",
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH EXPORTING foo = bar.",
  `GET PROPERTY OF sadf-OBJ PROPERTY = VALUE NO FLUSH QUEUE-ONLY
                    EXPORTING #1 = P1
                              #2 = P2
                              #3 = P3
                              #4 = P4.`,
  `GET PROPERTY OF foo-bar PROPERTY = val->moo-obj NO FLUSH QUEUE-ONLY.`,
  `GET PROPERTY OF foo-bar 'foo' = l_foo NO FLUSH QUEUEONLY.`,
];

statementType(tests, "GET PROPERTY", Statements.GetProperty);

const versionsFail = [
  {abap: `GET PROPERTY OF ctrl-obj prop = val NO FLUSH.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET PROPERTY");

it("GET PROPERTY reads the property name and writes the result", () => {
  const node = getStatements("GET PROPERTY OF ole property = result EXPORTING #1 = argument.")[0];
  expect(node.findDirectExpressions(Source).map(s => s.concatTokens())).to.deep.equal(["property"]);
  expect(node.findDirectExpressions(Target).map(t => t.concatTokens())).to.deep.equal(["result"]);
});
