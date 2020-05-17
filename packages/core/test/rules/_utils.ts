import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IRule} from "../../src/rules/_irule";
import {IRegistry} from "../../src/_iregistry";
import {IEdit} from "../../src/edit";
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

function applyEdit(reg: IRegistry, edit: IEdit) {

  for (const filename in edit) {
    let rows = reg.getFileByName(filename)?.getRawRows();
    if (rows === undefined) {
      throw new Error("applyEdit, file not found");
    }

    for (const e of edit[filename]) {
      if (e.range.start.getRow() === e.range.end.getRow()) {
        const line = rows[e.range.start.getRow() - 1];
        rows[e.range.start.getRow() - 1] =
          line.substr(0, e.range.start.getCol() - 1) +
          e.newText +
          line.substr(e.range.end.getCol() - 1);
      } else {
        const first = rows[e.range.start.getRow() - 1];
        let res = first.substr(0, e.range.start.getCol() - 1) + e.newText;
        const last = rows[e.range.end.getRow() - 1];
        res = res + last.substr(e.range.end.getCol() - 1);
        // delete middle lines
        rows.splice(e.range.start.getRow(), e.range.end.getRow() - e.range.start.getRow());
        // clean up
        rows[e.range.start.getRow() - 1] = res;
        rows = rows.join("\n").split("\n"); // if the edit contained newlines and multiple edits
      }
    }
    expect(rows.length).to.be.greaterThan(0);
    const result = new MemoryFile(filename, rows.join("\n"));

    reg.updateFile(result);
  }

  reg.parse();
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
        applyEdit(reg, fix!);
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