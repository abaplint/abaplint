import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IRule} from "../../src/rules/_irule";

export function testRule(tests: any, rule: new () => IRule) {
  const nrule = new rule();
  describe("test " + nrule.getKey() + " rule", function () {
    // note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
      const reg = new Registry().addFile(new MemoryFile("cl_foo.prog.abap", test.abap)).parse();
      const issues = nrule.run(reg.getObjects()[0], reg);
      it("\"" + test.abap + "\" should have " + test.cnt + " issue(s)", () => {
        expect(issues.length).to.equals(test.cnt);
      });
    });
  });
}