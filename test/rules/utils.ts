import {MemoryFile} from "../../src/files";
import Runner from "../../src/runner";
import {expect} from "chai";

export function testRule(tests, description: string, rule: new () => any) {
  describe(description, function () {
    // note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test) => {
      let issues = new Runner([new MemoryFile("cl_foo.clas.abap", test.abap)]).findIssues();
      issues = issues.filter((i) => { return i.getRule() instanceof rule; });
      it("\"" + test.abap + "\" should have " + test.cnt + " issue(s)", () => {
        expect(issues.length).to.equals(test.cnt);
      });
    });
  });
}