import "../typings/index.d.ts";
import {File, ParsedFile} from "../src/file";
import * as chai from "chai";
import * as fs from "fs";
import Runner from "../src/runner";

let expect = chai.expect;

function helper(filename: string): ParsedFile {
  let buf = fs.readFileSync("./test/abap/" + filename, "utf8");
  let file = Runner.parse([new File(filename, buf)])[0];
  return file;
}

describe("count_statements", () => {
  let tests = [
    {file: "zhello01",   statements: 2},
    {file: "zhello02",   statements: 2},
    {file: "zhello03",   statements: 2},
    {file: "zhello04",   statements: 2},
    {file: "zhello05",   statements: 2},
    {file: "zhello06",   statements: 2},
    {file: "zhello07",   statements: 3},
    {file: "zhello08",   statements: 3},
    {file: "zhello09",   statements: 3},
    {file: "zhello10",   statements: 5},
    {file: "zif01",      statements: 4},
    {file: "zif02",      statements: 6},
    {file: "zif03",      statements: 8},
    {file: "zcomment01", statements: 2},
    {file: "zcomment02", statements: 2},
    {file: "zcomment03", statements: 3},
    {file: "zcomment04", statements: 3},
    {file: "zcomment05", statements: 4},
    {file: "zform01",    statements: 5},
    {file: "zselect01",  statements: 4},
  ];

  tests.forEach((test) => {
    let statements = helper(test.file + ".prog.abap").getStatements();

    it(test.file + " should have " + test.statements + " statements", () => {
      expect(statements.length).to.equals(test.statements);
    });
  });
});