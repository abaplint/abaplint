import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {StatementLength, StatementLengthConf} from "../../src/rules/statement_length";
import {Issue} from "../../src/issue";

function findIssues(abap: string, conf?: StatementLengthConf): readonly Issue[] {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new StatementLength();
  if (conf) {
    rule.setConfig(conf);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

// "lv_text = `aaa` && `aaa` && ... .", every operand on a line of its own
function concatenation(operands: number, indentation: string, literal = "`" + "a".repeat(98) + "`"): string {
  const rows: string[] = [];
  for (let i = 0; i < operands; i++) {
    rows.push(indentation + literal);
  }
  return "DATA lv_text TYPE string.\nlv_text = " + rows.join(" &&\n").trimStart() + ".";
}

describe("Rule: statement_length", () => {

  it("over the limit", () => {
    // "lv_text = " + 300 operands of 100 characters + 299 times " && " + "."
    const abap = concatenation(300, "  ");
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(2);
    expect(issues[0].getStart().getCol()).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Reduce statement length to max 28000, currently 31207");
  });

  it("under the limit", () => {
    const issues = findIssues(concatenation(200, "  "));
    expect(issues.length).to.equal(0);
  });

  it("over the limit by raw characters, under when condensed", () => {
    // short literals, the indentation in front of each makes the raw statement longer than the limit
    const abap = concatenation(200, " ".repeat(200) + "\n\n", "`a`");
    expect(abap.length).to.be.greaterThan(28000);
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("a comment line inside the statement does not count", () => {
    const comment = "\n* " + "c".repeat(200) + "\n";
    const withComments = concatenation(200, "  ").replace(/ &&\n/g, " &&" + comment);
    expect(withComments.length).to.be.greaterThan(28000);
    expect(findIssues(withComments).length).to.equal(0);

    // and the statement around the comments is still measured
    const over = concatenation(300, "  ").replace(/ &&\n/g, " &&" + comment);
    const issues = findIssues(over);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Reduce statement length to max 28000, currently 31207");
  });

  it("an end of line comment inside the statement does not count", () => {
    const abap = concatenation(200, "  ").replace(/ &&\n/g, " && \" " + "c".repeat(200) + "\n");
    expect(abap.length).to.be.greaterThan(28000);
    expect(findIssues(abap).length).to.equal(0);
  });

  it("maxLength changes the limit", () => {
    const abap = concatenation(200, "  ");
    const conf = new StatementLengthConf();
    conf.maxLength = 1000;
    const issues = findIssues(abap, conf);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Reduce statement length to max 1000, currently 20807");
  });

  it("chained statement, each statement of the chain is measured by itself", () => {
    const long = "`" + "a".repeat(60) + "`";
    const abap = "WRITE: " + long + ",\n  " + long + ",\n  `short`.";
    const conf = new StatementLengthConf();
    conf.maxLength = 100;
    // together more than 100, no single one is
    expect(findIssues(abap, conf).length).to.equal(0);

    conf.maxLength = 50;
    const issues = findIssues(abap, conf);
    expect(issues.length).to.equal(2);
    expect(issues[0].getMessage()).to.equal("Reduce statement length to max 50, currently 69");
  });

  it("macro definition, content not reported", () => {
    const abap = "DEFINE _macro.\n  WRITE `" + "a".repeat(200) + "`.\nEND-OF-DEFINITION.";
    const conf = new StatementLengthConf();
    conf.maxLength = 100;
    expect(findIssues(abap, conf).length).to.equal(0);
  });

  it("parser error, not reported", () => {
    const abap = "foo bar `" + "a".repeat(200) + "`.";
    const conf = new StatementLengthConf();
    conf.maxLength = 100;
    expect(findIssues(abap, conf).length).to.equal(0);
  });

});
