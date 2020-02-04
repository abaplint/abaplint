import {expect} from "chai";
import {ABAPParser} from "../../src/abap/abap_parser";
import {MemoryFile} from "../../src";
import {Config} from "../../src/config";
import {IFile} from "../../src/files/_ifile";
import {Unknown} from "../../src/abap/statements/_statement";

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

    const {issues, output} = new ABAPParser().parse(files, Config.getDefault());
    expect(issues.length).to.equal(0);
    expect(output.length).to.equal(files.length);

    for (const file of output) {
      for (const statement of file.getStatements()) {
        expect(statement.get()).to.not.be.instanceof(Unknown);
      }
    }
  });
});