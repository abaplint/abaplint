import {getStatements, statementType, statementVersionFail} from "../_utils";
import {expect} from "chai";
import {Source, Target} from "../../../src/abap/2_statements/expressions";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "COMMUNICATION INIT ID c DESTINATION dest.",
  "COMMUNICATION ALLOCATE ID c.",
  "COMMUNICATION SEND ID c BUFFER connect.",
  "COMMUNICATION DEALLOCATE ID c.",
  "COMMUNICATION SEND ID c BUFFER <output> LENGTH slenx.",
  "COMMUNICATION RECEIVE ID c BUFFER input DATAINFO dinf STATUSINFO sinf RECEIVED rlen.",
  "COMMUNICATION ACCEPT ID c.",
  "COMMUNICATION RECEIVE ID id BUFFER buffer LENGTH length DATAINFO datainfo STATUSINFO statusinfo RECEIVED received.",
  `COMMUNICATION DEALLOCATE ID id RETURNCODE rc.`,
  `COMMUNICATION ALLOCATE ID id RETURNCODE rc.`,
  `COMMUNICATION SEND ID id LENGTH len BUFFER <b> RETURNCODE rc.`,
];

statementType(tests, "COMMUNICATION", Statements.Communication);

const versionsFail = [
  {abap: `COMMUNICATION INIT ID c DESTINATION dest.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "COMMUNICATION");

describe("COMMUNICATION operand roles", () => {
  const cases = [
    {abap: "COMMUNICATION INIT ID conversation DESTINATION destination.", reads: ["destination"], writes: ["conversation"]},
    {abap: "COMMUNICATION ACCEPT ID conversation.", reads: [], writes: ["conversation"]},
    {abap: "COMMUNICATION ALLOCATE ID conversation RETURNCODE rc.", reads: ["conversation"], writes: ["rc"]},
    {abap: "COMMUNICATION SEND ID conversation LENGTH length BUFFER buffer RETURNCODE rc.",
      reads: ["conversation", "length", "buffer"], writes: ["rc"]},
    {abap: "COMMUNICATION RECEIVE ID conversation BUFFER buffer LENGTH length DATAINFO info STATUSINFO status RECEIVED received.",
      reads: ["conversation", "length"], writes: ["buffer", "info", "status", "received"]},
  ];
  for (const test of cases) {
    it(test.abap, () => {
      const node = getStatements(test.abap)[0];
      expect(node.findDirectExpressions(Source).map(s => s.concatTokens())).to.deep.equal(test.reads);
      expect(node.findDirectExpressions(Target).map(t => t.concatTokens())).to.deep.equal(test.writes);
    });
  }
});
