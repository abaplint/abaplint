import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {BehaviorDefinition} from "../../src/objects";
import {Registry} from "../../src/registry";
import {BDEFCheckSyntax} from "../../src/rules";

const ddls = `define root view entity ZR4_VIEW as select from zr4_data { key id, amount }`;

const bdef = `managed implementation in class zbp_r4_view unique;
strict ( 2 );
define behavior for ZR4_VIEW alias Item
persistent table zr4_data
lock master
authorization master ( instance )
{ create; update; delete; field ( readonly ) id; }`;

const clas = `CLASS zbp_r4_view DEFINITION PUBLIC ABSTRACT FINAL FOR BEHAVIOR OF zr4_view.
ENDCLASS.
CLASS zbp_r4_view IMPLEMENTATION.
ENDCLASS.`;

function run(files: MemoryFile[]): Issue[] {
  const reg = new Registry().addFiles(files).parse();
  const rule = new BDEFCheckSyntax().initialize(reg);
  const issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    if (obj instanceof BehaviorDefinition) {
      issues.push(...rule.run(obj));
    }
  }
  return issues;
}

describe("Rule: bdef_check_syntax", () => {

  it("all found", () => {
    const issues = run([
      new MemoryFile("zr4_view.ddls.asddls", ddls),
      new MemoryFile("zr4_view.bdef.asbdef", bdef),
      new MemoryFile("zbp_r4_view.clas.abap", clas),
    ]);
    expect(issues.length).to.equal(0);
  });

  it("implementation class not found", () => {
    const issues = run([
      new MemoryFile("zr4_view.ddls.asddls", ddls),
      new MemoryFile("zr4_view.bdef.asbdef", bdef.replace("zbp_r4_view", "zbp_r4_missing")),
      new MemoryFile("zbp_r4_view.clas.abap", clas),
    ]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(`Implementation class "zbp_r4_missing" not found`);
  });

  it("implementation class in entity, not found", () => {
    const issues = run([
      new MemoryFile("zr4_view.ddls.asddls", ddls),
      new MemoryFile("zr4_view.bdef.asbdef", `managed;
define behavior for ZR4_VIEW alias Item
implementation in class zbp_r4_missing unique
lock master
{ }`),
    ]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(`Implementation class "zbp_r4_missing" not found`);
  });

  it("implementation class outside error namespace", () => {
    const issues = run([
      new MemoryFile("zr4_view.ddls.asddls", ddls),
      new MemoryFile("zr4_view.bdef.asbdef", bdef.replace("zbp_r4_view", "cl_bp_somewhere")),
    ]);
    expect(issues.length).to.equal(0);
  });

  it("entity not found", () => {
    const issues = run([
      new MemoryFile("zr4_view.bdef.asbdef", bdef),
      new MemoryFile("zbp_r4_view.clas.abap", clas),
    ]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(`Entity "ZR4_VIEW" not found`);
  });

  it("parser error, no check", () => {
    const issues = run([
      new MemoryFile("zr4_view.bdef.asbdef", `THIS IS NOT A BEHAVIOR DEFINITION ??? {{{`),
    ]);
    expect(issues.length).to.equal(0);
  });

});
