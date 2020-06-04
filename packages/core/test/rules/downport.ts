import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {Downport} from "../../src/rules";
import {Config} from "../../src/config";
import {Version} from "../../src";

function findIssues(abap: string) {
  const conf = Config.getDefault().get();
  conf.syntax.version = Version.v702;
  const conf702 = new Config(JSON.stringify(conf));

  const reg = new Registry(conf702).addFile(new MemoryFile("zdownport.prog.abap", abap)).parse();
  const rule = new Downport();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: downport", () => {

  it("parser error", () => {
    const issues = findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("all okay, pass along", () => {
    const issues = findIssues("WRITE bar.");
    expect(issues.length).to.equal(0);
  });

  it("Use CREATE OBJECT instead of NEW", () => {
    const issues = findIssues("foo = NEW #( ).");
    expect(issues.length).to.equal(1);
  });

});
