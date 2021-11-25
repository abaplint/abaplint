import {expect} from "chai";
import {StaticCallViaInstance} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";

async function runSingle(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const obj = reg.getFirstObject()!;
  return new StaticCallViaInstance().initialize(reg).run(obj);
}

describe("Rule: static_call_via_instance", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("find issue", async () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD foo.
    NEW lcl_bar( )->foo( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("solved", async () => {
    const abap = `CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD foo.
    lcl_bar=>foo( ).
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
