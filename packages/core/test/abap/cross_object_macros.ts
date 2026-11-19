import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src";

describe("cross object macros", () => {

  it("Stupid macros", () => {
    const file1 = new MemoryFile(`zcl_macro.clas.abap`, `CLASS zcl_macro DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PRIVATE SECTION.
    METHODS foobar.
ENDCLASS.

CLASS ZCL_MACRO IMPLEMENTATION.
  METHOD foobar.
    get_blah.
  ENDMETHOD.
ENDCLASS.`);
    const file2 = new MemoryFile(`zcl_macro.clas.macros.abap`, `INCLUDE zmacro.`);

    const file3 = new MemoryFile(`zmacro.prog.abap`, `DEFINE get_blah.
END-OF-DEFINITION.`);

    const reg = new Registry().addFiles([file1, file2, file3]);
    const issues = reg.findIssues().filter(i => i.getKey() === "parser_error");

    expect(issues.length).to.equal(0);
  });

  it("same macro name inline and in class macro include", () => {
    const classFile = () => new MemoryFile(`zcl_redef.clas.abap`, `CLASS zcl_redef DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS process.
ENDCLASS.

CLASS zcl_redef IMPLEMENTATION.
  METHOD process.
    DEFINE check_return.
      LOOP AT et_return INTO ls_return WHERE type = 'A' OR type = 'E'.
        WRITE ls_return.
      ENDLOOP.
    END-OF-DEFINITION.
    check_return.
  ENDMETHOD.
ENDCLASS.`);
    const macroFile = () => new MemoryFile(`zcl_redef.clas.macros.abap`, `DEFINE check_return.
  LOOP AT &1.
END-OF-DEFINITION.`);

    for (const files of [[classFile(), macroFile()], [macroFile(), classFile()]]) {
      const reg = new Registry().addFiles(files);
      const issues = reg.findIssues().filter(i => i.getKey() === "parser_error" || i.getKey() === "structure");
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    }
  });

});