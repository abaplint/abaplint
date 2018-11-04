import {expect} from "chai";
import {findIssues} from "../abap/_utils";

export function testRule(tests: any, description: string, rule: new () => any) {
  describe(description, function () {
    // note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
      let issues = findIssues(test.abap);
      issues = issues.filter((i) => { return i.getRule() instanceof rule; });
      it("\"" + test.abap + "\" should have " + test.cnt + " issue(s)", () => {
        expect(issues.length).to.equals(test.cnt);
      });
    });
  });
}