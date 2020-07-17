import {expect} from "chai";
import {ABAPParser} from "../../src/abap/abap_parser";
import {MemoryFile, ABAPFile} from "../../src";
import {IFile} from "../../src/files/_ifile";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {defaultVersion} from "../../src/version";

function expectNoUnknown(output: readonly ABAPFile[]) {
  for (const file of output) {
    for (const statement of file.getStatements()) {
      expect(statement.get()).to.not.be.instanceof(Unknown);
    }
  }
}

describe("abap_parser", () => {
  it("macro in class, no unknown expected", () => {
    const files: IFile[] = [];

    files.push(new MemoryFile("zcl_macro.clas.abap", `
  CLASS zcl_macro DEFINITION PUBLIC CREATE PUBLIC.
    PUBLIC SECTION.
    PROTECTED SECTION.
    PRIVATE SECTION.
      METHODS method.
  ENDCLASS.

  CLASS zcl_macro IMPLEMENTATION.
    METHOD method.
      _moo.
    ENDMETHOD.
  ENDCLASS.`));

    files.push(new MemoryFile("zcl_clas.macros.abap", `
  DEFINE _moo.
    WRITE 2.
  END-OF-DEFINITION.
    `));

    const {issues, output} = new ABAPParser(defaultVersion, []).parse(files);
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);
    expectNoUnknown(output);
  });

  it("macro in CASE, no unknown expected", () => {
    const files: IFile[] = [];

    files.push(new MemoryFile("ztest.prog.abap", `
DEFINE _bar.
  WHEN &1.
END-OF-DEFINITION.

DATA lv_bar.

CASE lv_bar.
  _bar 'a'.
ENDCASE.`));

    const {issues, output} = new ABAPParser(defaultVersion, []).parse(files);
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);
    expectNoUnknown(output);
  });

  it("double chaining", () => {
    const files: IFile[] = [];

    files.push(new MemoryFile("zcl_chaining.prog.abap", `data: : bar type c.`));

    const {issues, output} = new ABAPParser(defaultVersion, []).parse(files);
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);
    expectNoUnknown(output);
  });
});