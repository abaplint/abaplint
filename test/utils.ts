import {MemoryFile} from "../src/files";
import Config from "../src/config";
import Runner from "../src/runner";
import {expect} from "chai";
import {Version, versionToText} from "../src/version";
import {Unknown} from "../src/abap/statements/statement";
import {Structure} from "../src/abap/structures/_structure";

// utils for testing

function run(abap: string, text: string, type: any, version = Version.v750) {
  let config = Config.getDefault().setVersion(version);
  let file = new Runner([new MemoryFile("cl_foo.clas.abap", abap)], config).parse()[0];
  let slist = file.getStatements();

  it(text, () => {
    let compare = slist[0] instanceof type;
    expect(compare).to.equals(true);
// assumption: no colons in input
    expect(slist[0].getTokens().length).to.equal(file.getTokens(false).length);
  });
}

export function structureType(cas: {abap: string}[], expected: Structure): void {
  describe("Structure type", function() {
    cas.forEach((c: {abap: string}) => {
      it(c.abap, function () {
        let file = new Runner([new MemoryFile("cl_foo.clas.abap", c.abap)]).parse()[0];
        const statements = file.getStatements();
        const length = statements.length;
        const match = expected.getMatcher().run(statements.slice());

        expect(match.errorDescription).to.equal("");
        expect(length).to.equal(statements.length);
        expect(match.error).to.equal(false);
        expect(match.matched.length).to.equal(length);
      });
    });
  });
}

export function statementType(tests: any, description: string, type: any) {
  describe(description + " statement type", function() {
// note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
      run(test, "\"" + test + "\" should be " + description, type);
    });
  });
}

export function statementVersion(tests: any, description: string, type: any) {
  describe(description + " statement version,", function() {
// note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
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