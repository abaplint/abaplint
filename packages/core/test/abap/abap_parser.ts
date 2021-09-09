import {expect} from "chai";
import {ABAPParser} from "../../src/abap/abap_parser";
import {IFile} from "../../src/files/_ifile";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {defaultVersion} from "../../src/version";
import {ABAPFile} from "../../src/abap/abap_file";
import {MemoryFile} from "../../src/files/memory_file";

function expectNoUnknown(output: readonly ABAPFile[]) {
  for (const file of output) {
    for (const statement of file.getStatements()) {
      expect(statement.get()).to.not.be.instanceof(Unknown);
    }
  }
}

describe("abap_parser", () => {
  it("macro in class, no unknown expected", async () => {
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

  it("macro in CASE, no unknown expected", async () => {
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

  it("double chaining", async () => {
    const files: IFile[] = [];

    files.push(new MemoryFile("zcl_chaining.prog.abap", `data: : bar type c.`));

    const {issues, output} = new ABAPParser(defaultVersion, []).parse(files);
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);
    expectNoUnknown(output);
  });

  it("should build structure, even with Unknown statements", async () => {
    const abap = `
    INTERFACE if_foo.
      with_syntax_error
    ENDINTERFACE.`;

    const files = [new MemoryFile("zsdfdsfsd.prog.abap", abap)];

    const {issues, output} = new ABAPParser(defaultVersion, []).parse(files);
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);
    expect(output[0].getStructure()).to.not.equal(undefined);
  });

  it("Macro inside TYPES", async () => {
    const abap = `
    DEFINE _macro.
    END-OF-DEFINITION.
    TYPES: BEGIN OF ty_type.
      TYPES field TYPE c LENGTH 1.
      _macro.
    TYPES: END OF ty_type.`;

    const files = [new MemoryFile("macrointype.prog.abap", abap)];

    const {issues, output} = new ABAPParser(defaultVersion, []).parse(files);
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);
    expect(output[0].getStructure()).to.not.equal(undefined);
  });

  it("parsing, should not crash", async () => {
    const abap = `
CLASS lcl_client DEFINITION.
  PUBLIC SECTION.
    INTERFACES if_apc_wsp_client.
ENDCLASS.

CLASS lcl_client IMPLEMENTATION.
  method
ENDCLASS.`;

    const files = [new MemoryFile("macrointype.prog.abap", abap)];

    new ABAPParser(defaultVersion, []).parse(files);
  });

});