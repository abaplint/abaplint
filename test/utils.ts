import {File} from "../src/file";
import Config from "../src/config";
import Runner from "../src/runner";
import {expect} from "chai";
import {Version, versionToText} from "../src/version";
import {Unknown} from "../src/abap/statements/statement";

// utils for testing

function run(abap: string, text: string, type, version = Version.v750) {
  let config = Config.getDefault().setVersion(version);
  let file = new Runner([new File("cl_foo.clas.abap", abap)], config).parse()[0];
  let slist = file.getStatements();

  it(text, () => {
    let compare = slist[0] instanceof type;
//    console.dir(slist[0]);
    expect(compare).to.equals(true);
// assumption: no colons in input
    expect(slist[0].getTokens().length).to.equal(file.getTokens(false).length);
  });
}

export function statementType(tests, description: string, type) {
  describe(description + " statement type", function() {
// note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test) => {
      run(test, "\"" + test + "\" should be " + description, type);
    });
  });
}

export function statementVersion(tests, description: string, type) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test) => {
      run(test.abap, "\"" + test.abap + "\" should be " + description, type, test.ver);
// should fail in previous version
      let lower = test.ver - 1;
      run(test.abap,
          "\"" + test.abap + "\" should not work in lower version(" + versionToText(lower) + ")",
          Unknown,
          lower);
    });
  });
}