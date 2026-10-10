import {expect} from "chai";
import {Config} from "../../src/config";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {GenericRegex, GenericRegexConf} from "../../src/rules";
import {Severity} from "../../src/severity";
import {testRule} from "./_utils";

testRule([
  {abap: "WRITE 'TODO'.", cnt: 0},
  {abap: "", cnt: 0},
], GenericRegex);

const config = new GenericRegexConf();
config.regexes = ["\\bTODO\\b", "BREAK-POINT"];
testRule([
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "WRITE 'TODO'.", cnt: 1},
  {abap: "* todo: implement this", cnt: 1},
  {abap: "BREAK-POINT.", cnt: 1},
  {abap: "WRITE 'TODOS'.", cnt: 0},
  {abap: "WRITE 'TODO TODO'.", cnt: 2},
  {abap: "* TODO\n* TODO", cnt: 2},
  {abap: "BREAK-POINT. \" TODO", cnt: 2},
  {abap: "TODO parser error", cnt: 1},
], GenericRegex, config);

function run(abap: string, conf = config) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new GenericRegex();
  rule.setConfig(conf);
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("generic_regex", () => {
  it("reports the matching range and error severity", () => {
    const issues = run("WRITE 'hello'.\n  WRITE 'TODO TODO'.");
    expect(issues.length).to.equal(2);
    expect(issues[0].getFilename()).to.equal("zfoo.prog.abap");
    expect(issues[0].getKey()).to.equal("generic_regex");
    expect(issues[0].getStart().getRow()).to.equal(2);
    expect(issues[0].getStart().getCol()).to.equal(10);
    expect(issues[0].getEnd().getRow()).to.equal(2);
    expect(issues[0].getEnd().getCol()).to.equal(14);
    expect(issues[1].getStart().getCol()).to.equal(15);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
    expect(issues[0].getMessage()).to.contain("\\bTODO\\b");
  });

  it("supports configured severity", () => {
    const conf = new GenericRegexConf();
    conf.regexes = ["TODO"];
    conf.severity = Severity.Warning;
    expect(run("* TODO", conf)[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("defaults a missing regex list to empty", () => {
    const rule = new Config('{"rules":{"generic_regex":{}}}').getEnabledRules()[0] as GenericRegex;
    expect(rule.getConfig().regexes).to.deep.equal([]);
  });

  it("handles anchors with LF and CRLF line endings", () => {
    const conf = new GenericRegexConf();
    conf.regexes = ["^\\* TODO$"];
    expect(run("* TODO\n* TODO", conf).length).to.equal(2);
    expect(run("* TODO\r\n* TODO", conf).length).to.equal(2);
  });

  it("handles zero-length matches without looping", () => {
    const conf = new GenericRegexConf();
    conf.regexes = ["(?=TODO)", "$"];
    const issues = run("* TODO", conf);
    expect(issues.length).to.equal(2);
    expect(issues[0].getStart().getCol()).to.equal(3);
    expect(issues[0].getEnd().getCol()).to.equal(3);
    expect(issues[1].getStart().getCol()).to.equal(7);
  });

  it("rejects invalid regexes with the rule and pattern in the error", () => {
    const conf = new GenericRegexConf();
    conf.regexes = ["["];
    expect(() => run("WRITE 'hello'.", conf)).to.throw('generic_regex: Invalid regular expression "["');
  });

  it("checks all files of an object, including XML", () => {
    const reg = new Registry()
      .addFile(new MemoryFile("zfoo.prog.abap", "* TODO"))
      .addFile(new MemoryFile("zfoo.prog.xml", "<description>TODO</description>"))
      .parse();
    const rule = new GenericRegex();
    rule.setConfig(config);
    const issues = rule.initialize(reg).run(reg.getFirstObject()!);
    expect(issues.map(issue => issue.getFilename())).to.have.members(["zfoo.prog.abap", "zfoo.prog.xml"]);
  });

  it("is available through configuration and respects file exclusions", () => {
    const conf = new Config(JSON.stringify({rules: {
      generic_regex: {regexes: ["TODO"], exclude: ["zskip\\.prog\\.abap$"]},
    }}));
    const reg = new Registry(conf)
      .addFile(new MemoryFile("zfoo.prog.abap", "* TODO"))
      .addFile(new MemoryFile("zskip.prog.abap", "* TODO"))
      .parse();
    const issues = reg.findIssues();
    expect(issues.length).to.equal(1);
    expect(issues[0].getKey()).to.equal("generic_regex");
    expect(issues[0].getFilename()).to.equal("zfoo.prog.abap");
  });
});
