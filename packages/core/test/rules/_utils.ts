import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IRule} from "../../src/rules/_irule";
import {applyEditSingle} from "../../src/edit_helper";
import {Issue} from "../../src/issue";
import {IConfiguration} from "../../src/_config";
import {Config, IFile} from "../../src";

export function fullErrorNamespace(): IConfiguration {
  const conf = Config.getDefault().get();
  conf.syntax.errorNamespace = ".";
  return new Config(JSON.stringify(conf));
}

export function runMulti(files: {filename: string, contents: string}[], config?: IConfiguration): readonly Issue[] {
  const reg = new Registry();
  if (config) {
    reg.setConfig(config);
  }
  for (const obj of files) {
    const file = new MemoryFile(obj.filename, obj.contents);
    reg.addFile(file);
  }
  return reg.parse().findIssues();
}

export type TestRuleType = {abap: string, cnt: number, only?: boolean, fix?: boolean}[];

export function testRule(tests: TestRuleType, rule: new () => IRule, config?: any, testTitle?: string) {
  const nrule = new rule();
  if (config) {
    nrule.setConfig(config);
  }
  testTitle = testTitle || `test ${nrule.getMetadata().key} rule`;
  describe(testTitle, function () {
    // note that timeout() only works inside function()
    this.timeout(250);
    tests.forEach((test) => {
      const title = "\"" + test.abap + "\" should have " + test.cnt + " issue(s)";
      const callback = () => {
        const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
        const issues = nrule.initialize(reg).run(reg.getFirstObject()!);
        expect(issues.length).to.equals(test.cnt);

        if (test.fix !== undefined) {
          issues.forEach((issue) => {
            if (test.fix === true) {
              expect(issue.getFix()).to.not.equals(undefined, "Expected fix to exist");
            }
            else {
              expect(issue.getFix()).to.equals(undefined, "Expected fix not to exist");
            }
          });
        }
      };

      if (test.only === true) {
        it.only(title, callback);
      } else {
        it(title, callback);
      }
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
    this.timeout(250);
    tests.forEach((test) => {
      it("Fix \"" + test.input + "\"", () => {
        testRuleFixSingle(test.input, test.output, nrule);
      });
    });
  });
}

export function testRuleFixSingle(
  input: string, expected: string, rule: IRule, conf?: IConfiguration, extraFiles?: IFile[], noIssuesAfter = true) {
  const reg = new Registry(conf).addFile(new MemoryFile("zfoo.prog.abap", input));
  for (const f of extraFiles || []) {
    reg.addFile(f);
  }
  reg.parse();
  let issues = rule.initialize(reg).run(reg.getFirstObject()!);
  expect(issues.length).to.equal(1, "single issue expected");

  const fix = issues[0].getFix();
  expect(fix).to.not.equal(undefined, "Fix should exist");
  applyEditSingle(reg, fix!);

  reg.parse();
//  console.dir(reg.getFirstObject()?.getFiles()[0].getRaw());

  issues = rule.initialize(reg).run(reg.getFirstObject()!);
//  console.dir(issues);
  if (noIssuesAfter === true) {
    expect(issues.length).to.equal(0, "after fix, no issue expected");
  }
  const output = reg.getFirstObject()!.getFiles()[0];
  expect(output.getRaw()).to.equal(expected);
}

export function testRuleFixCount(
  input: string, expected: string, rule: IRule, conf?: IConfiguration, extraFiles?: IFile[], noIssuesAfter = true, count = 1) {
  const reg = new Registry(conf).addFile(new MemoryFile("zfoo.prog.abap", input));
  for (const f of extraFiles || []) {
    reg.addFile(f);
  }
  reg.parse();
  let issues = rule.initialize(reg).run(reg.getFirstObject()!);
//  console.dir(issues);
  expect(issues.length).to.equal(count, "single issue expected");

  for (const issue of [...issues].reverse()) {
    const fix = issue.getFix();
    expect(fix).to.not.equal(undefined, "Fix should exist");
    applyEditSingle(reg, fix!);
  }

  reg.parse();
//  console.dir(reg.getFirstObject()?.getFiles()[0].getRaw());

  issues = rule.initialize(reg).run(reg.getFirstObject()!);
//  console.dir(issues);
  if (noIssuesAfter === true) {
    expect(issues.length).to.equal(0, "after fix, no issue expected");
  }
  const output = reg.getFirstObject()!.getFiles()[0];
  expect(output.getRaw()).to.equal(expected);
}

export function testRuleWithVariableConfig(tests: any, rule: new () => IRule, testTitle?: string) {
  const nrule = new rule();
  testTitle = testTitle || `test ${nrule.getMetadata().key} rule`;
  describe(testTitle, function () {
    this.timeout(250);
    tests.forEach((test: any) => {
      it(test.description, () => {
        const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
        nrule.setConfig(test.config);
        const issues = nrule.initialize(reg).run(reg.getFirstObject()!);
        expect(issues.length).to.equals(test.issueLength);
      });
    });
  });
}