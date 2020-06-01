import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IRule} from "../../src/rules/_irule";
import {applyEditSingle} from "../../src/edit_helper";
import {Issue} from "../../src/issue";

export function runMulti(files: {filename: string, contents: string}[]): readonly Issue[] {
  const reg = new Registry();
  for (const obj of files) {
    const file = new MemoryFile(obj.filename, obj.contents);
    reg.addFile(file);
  }
  return reg.parse().findIssues();
}

export function testRule(tests: {abap: string, cnt: number}[], rule: new () => IRule, config?: any, testTitle?: string) {
  const nrule = new rule();
  if (config) {
    nrule.setConfig(config);
  }
  testTitle = testTitle || `test ${nrule.getMetadata().key} rule`;
  describe(testTitle, function () {
    // note that timeout() only works inside function()
    this.timeout(200);
    tests.forEach((test) => {
      it("\"" + test.abap + "\" should have " + test.cnt + " issue(s)", () => {
        const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
        const issues = nrule.run(reg.getObjects()[0], reg);
        expect(issues.length).to.equals(test.cnt);
      });
    });
  });
}

export function testRuleFix(tests: {input: string, output: string}[], rule: new () => IRule, config?: any, testTitle?: string) {
  const nrule = new rule();
  if (config) {
    nrule.setConfig(config);
  }
  testTitle = testTitle || `test ${nrule.getMetadata().key} rule fixes`;
  describe(testTitle, function () {
    // note that timeout() only works inside function()
    this.timeout(200);
    tests.forEach((test) => {
      it("Fix \"" + test.input + "\"", () => {
        const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.input)).parse();
        let issues = nrule.run(reg.getObjects()[0], reg);
        expect(issues.length).to.equal(1);

        const fix = issues[0].getFix();
        expect(fix).to.not.equal(undefined, "Fix should exist");
        applyEditSingle(reg, fix!);

        reg.parse();
        issues = nrule.run(reg.getObjects()[0], reg);
        expect(issues.length).to.equal(0);
        const output = reg.getObjects()[0].getFiles()[0];
        expect(output.getRaw()).to.equal(test.output);
      });
    });
  });
}

export function testRuleWithVariableConfig(tests: any, rule: new () => IRule, testTitle?: string) {
  const nrule = new rule();
  testTitle = testTitle || `test ${nrule.getMetadata().key} rule`;
  describe(testTitle, function () {
    this.timeout(200);
    tests.forEach((test: any) => {
      it(test.description, () => {
        const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
        nrule.setConfig(test.config);
        const issues = nrule.run(reg.getObjects()[0], reg);
        expect(issues.length).to.equals(test.issueLength);
      });
    });
  });
}