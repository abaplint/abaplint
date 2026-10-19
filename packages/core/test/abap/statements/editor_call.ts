import {getStatements, statementExpectFail, statementType, statementVersionFail} from "../_utils";
import {expect} from "chai";
import {Source, Target} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "EDITOR-CALL FOR lv_source DISPLAY-MODE TITLE lv_title.",
  "EDITOR-CALL FOR REPORT 'ZFOO'.",
  "EDITOR-CALL FOR lt_text TITLE lv_title DISPLAY-MODE.",
  "EDITOR-CALL FOR lt_text.",
  "EDITOR-CALL FOR lt_text TITLE lv_title.",
  "EDITOR-CALL FOR REPORT report TITLE lv_title DISPLAY-MODE.",
  "EDITOR-CALL FOR REPORT report DISPLAY-MODE TITLE lv_title.",
];
statementType(tests, "EDITOR-CALL", Statements.EditorCall);

const fails = [
  `EDITOR-CALL FOR lt_tab TITLE |Display| DISPLAY-MODE.`,
];
statementExpectFail(fails, "EDITOR-CALL");

const versionsFail = [
  {abap: `EDITOR-CALL FOR lv_source DISPLAY-MODE TITLE lv_title.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "EDITOR-CALL");

describe("EDITOR-CALL operand roles", () => {
  for (const options of ["", " TITLE title", " DISPLAY-MODE", " TITLE title DISPLAY-MODE", " DISPLAY-MODE TITLE title"]) {
    it(`reads a displayed table and writes an editable table${options}`, () => {
      const node = getStatements(`EDITOR-CALL FOR lines${options}.`)[0];
      const display = options.includes("DISPLAY-MODE");
      expect(node.findDirectExpressions(Source)).to.have.length(display ? 1 : 0);
      expect(node.findDirectExpressions(Target)).to.have.length(display ? 0 : 1);
    });
  }
});
