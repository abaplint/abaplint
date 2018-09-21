import * as chai from "chai";
import Runner from "../src/runner";
import Config from "../src/config";
import {Version} from "../src/version";
import {File} from "../src/file";
import {ParserError} from "../src/rules/parser_error";

let expect = chai.expect;

let tests = [
  {abap: "foo = bar."},
//  {abap: "foo = |Hello|."},
];

function run(abap: string): number {
  let parsed = new Runner().parse([new File("temp.abap", abap)]);

  let downed = Runner.downport(parsed);

  let config = Config.getDefault();
  config.setVersion(Version.v700);

  let issues = new Runner(config).run(downed).filter(
    (e) => { return e.getKey() === new ParserError().getKey(); });

  return issues.length;
}

describe("downport", () => {
  tests.forEach((test) => {
    it("test \"" + test.abap + "\"", () => {
      expect(run(test.abap)).to.equals(0);
    });
  });
});