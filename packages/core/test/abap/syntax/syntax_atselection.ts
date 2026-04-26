import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Issue} from "../../../src/issue";
import {Config} from "../../../src/config";
import {IRegistry} from "../../../src/_iregistry";
import {getABAPObjects} from "../../get_abap";
import {Version} from "../../../src/version";
import {MemoryFile} from "../../../src/files/memory_file";

function run(reg: IRegistry, globalConstants?: string[], version?: Version, errorNamespace?: string): Issue[] {
  let ret: Issue[] = [];

  const config = reg.getConfig().get();
  if (globalConstants) {
    config.syntax.globalConstants = globalConstants;
  }
  if (version) {
    config.syntax.version = version;
  }
  if (errorNamespace) {
    config.syntax.errorNamespace = errorNamespace;
  }
  reg.setConfig(new Config(JSON.stringify(config)));
  reg.parse();

  for (const obj of getABAPObjects(reg)) {
    for (const file of obj.getABAPFiles()) {
      if (file.getStructure() === undefined) {
        throw new Error("check variables test, parser error");
      }
    }
    ret = ret.concat(new SyntaxLogic(reg, obj).run().issues);
  }
  return ret;
}

function runProgram(abap: string, globalConstants?: string[], version?: Version, errorNamespace?: string): Issue[] {
  const file = new MemoryFile("zfoobar.prog.abap", abap);
  const reg: IRegistry = new Registry().addFile(file);
  return run(reg, globalConstants, version, errorNamespace);
}

////////////////////////////////////////////////////////////

describe("syntax.ts, AT SELECTION SCREEN scoping", () => {

  it("ok, basic", () => {
    const abap = `
AT SELECTION-SCREEN.
  DATA(test) = 1.

START-OF-SELECTION.
  DATA(test) = 2.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, global", () => {
    const abap = `
DATA gv_class TYPE string.

AT SELECTION-SCREEN OUTPUT.
  DATA gv_class TYPE i.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, start is global", () => {
    const abap = `
START-OF-SELECTION.
  DATA(test) = 1.

FORM foo.
  WRITE / test.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("ok, cdef", () => {
    const abap = `
DATA gv_repo_name TYPE c LENGTH 60.

AT SELECTION-SCREEN OUTPUT.
  WRITE 'bar'.

CLASS lcl_abapgit_ci DEFINITION.
ENDCLASS.
CLASS lcl_abapgit_ci IMPLEMENTATION.
ENDCLASS.

AT SELECTION-SCREEN.
  NEW lcl_abapgit_ci( ).

START-OF-SELECTION.
  WRITE 'sdf'.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("expect error", () => {
    const abap = `
AT SELECTION-SCREEN.
  DATA(test) = 1.

START-OF-SELECTION.
  WRITE / test.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.contain("not found");
  });

  it("ok", () => {
    const abap = `
AT SELECTION-SCREEN OUTPUT.
  LOOP AT SCREEN.
  ENDLOOP.

MODULE sdfs OUTPUT.
  DATA ls_style TYPE i.
ENDMODULE.

FORM foo.
  CLEAR ls_style.
ENDFORM.`;
    const issues = runProgram(abap);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

});
