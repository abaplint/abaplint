import "../typings/index.d.ts";
import File from "../src/file";
import Runner from "../src/runner";
import * as chai from "chai";
import {Version} from "../src/version";
import {Unknown} from "../src/statements/statement";

// utils for testing

let expect = chai.expect;

function run(abap: string, text: string, type, version = Version.v750) {
  let file = new File("temp.abap", abap);
  Runner.run([file], version);
  let slist = file.getStatements();

  it(text, () => {
    let compare = slist[0] instanceof type;
    expect(compare).to.equals(true);
// assumption: no colons in input
    expect(slist[0].getTokens().length).to.equal(file.getTokens().length);
  });
}

export function statementType(tests, description: string, type) {
  describe(description + " statement type", () => {
    tests.forEach((test) => {
      run(test, "\"" + test + "\" should be " + description, type);
    });
  });
}

export function statementVersion(tests, description: string, type) {
  describe(description + " statement version,", () => {
    tests.forEach((test) => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.ver);
// should fail in previous version
      run(test.abap, "\"" + test.abap + "\" should be Unknown", Unknown, test.ver - 1);
    });
  });
}