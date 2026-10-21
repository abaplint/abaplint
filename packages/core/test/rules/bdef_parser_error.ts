import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {BDEFParserError} from "../../src/rules";

function run(bdef: string) {
  const reg = new Registry().addFile(new MemoryFile("zi_travel.bdef.asbdef", bdef)).parse();
  return new BDEFParserError().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: bdef_parser_error", () => {

  it("no error", () => {
    const issues = run(`managed implementation in class zbp_i_travel unique;
define behavior for ZI_Travel alias Travel
lock master
{
  create;
}`);
    expect(issues.length).to.equal(0);
  });

  it("parser error", () => {
    const issues = run(`THIS IS NOT A BEHAVIOR DEFINITION ??? {{{`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("BDEF Parser error");
  });

  it("empty file", () => {
    const issues = run(``);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("BDEF Parser error, empty file");
  });

});
