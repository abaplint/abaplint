import {getStatements, statementType, statementVersionFail} from "../_utils";
import {expect} from "chai";
import {Source, Target} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "get dataset p_filename position lv_size.",
  "GET DATASET me->mv_file ATTRIBUTES ls_attr.",
];

statementType(tests, "GET DATASET", Statements.GetDataset);

const versionsFail = [
  {abap: `get dataset p_filename position lv_size.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET DATASET");

it("GET DATASET reads the dataset and writes the attributes and position", () => {
  const node = getStatements("GET DATASET dataset ATTRIBUTES attributes POSITION position.")[0];
  expect(node.findDirectExpressions(Source).map(s => s.concatTokens())).to.deep.equal(["dataset"]);
  expect(node.findDirectExpressions(Target).map(t => t.concatTokens())).to.deep.equal(["attributes", "position"]);
});
