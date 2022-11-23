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
    return result;
  }
}

describe("Morph", () => {

  it("test", async () => {
    const ts = `let foo: number = 5;`;
    const abap = `DATA(foo) = 5.`;
    expect(test(ts)).to.equal(abap);
  });

});