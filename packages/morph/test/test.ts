import {expect} from "chai";
import {Project} from "ts-morph";
import {handleStatement} from "../src/statements";

function test(ts: string) {
  const project = new Project();
  const file = project.createSourceFile("input.ts", ts);

  const diagnostics = project.getPreEmitDiagnostics();
  if (diagnostics.length > 0) {
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
    return undefined;
  } else {
    let result = "";
    for (const s of file.getStatements()) {
      result += handleStatement(s);
    }
    return result.trim();
  }
}

describe("Morph", () => {

  it("test", async () => {
    const ts = `let foo: number = 5;`;
    const abap = `DATA(foo) = 5.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("return type", async () => {
    const ts = `
type foo = {bar: number};
class lcl {
  public run(): foo {
    return {bar: 2};
  }
}`;
    const abap = `
TYPES BEGIN OF foo.
  TYPES bar TYPE i.
TYPES END OF foo.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run RETURNING VALUE(return) TYPE foo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
return = VALUE #( bar = 2 ).
RETURN.
  ENDMETHOD.

ENDCLASS.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("trim", async () => {
    const ts = `
let foo: string = "foo";
let bar: string = "foo";
foo = bar.trim();`;
    const abap = `
DATA(foo) = |foo|.
DATA(bar) = |foo|.
foo = condense( bar ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

});