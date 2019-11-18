import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IRule} from "../../src/rules/_irule";

export function testRule(tests: any, rule: new () => IRule, config?: any, testTitle?: string) {
  const nrule = new rule();
  if (config) {
    nrule.setConfig(config);
  }
  testTitle = testTitle || `test ${nrule.getKey()} rule`;
  describe(testTitle, function () {
    // note that timeout() only works inside function()
    this.timeout(200); // tslint:disable-line
    tests.forEach((test: any) => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
      const issues = nrule.run(reg.getObjects()[0], reg);
      // tslint:disable-next-line: restrict-plus-operands
      it("\"" + test.abap + "\" should have " + test.cnt + " issue(s)", () => {
        expect(issues.length).to.equals(test.cnt);
      });
    });
  });
}