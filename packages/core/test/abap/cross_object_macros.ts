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

  it("macro defined in both macros include and inline, inline redefinition wins, issue 4190", () => {
    const main = `CLASS zcl_parser_error_test DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS process.
ENDCLASS.
CLASS zcl_parser_error_test IMPLEMENTATION.
  METHOD process.
    DATA et_return TYPE STANDARD TABLE OF bapiret2.
    DEFINE check_return.
      LOOP AT et_return TRANSPORTING NO FIELDS WHERE type = 'A' OR type = 'E'.
        EXIT.
      ENDLOOP.
    END-OF-DEFINITION.
    check_return.
  ENDMETHOD.
ENDCLASS.`;
    const macros = `DEFINE check_return.
  LOOP AT &1 TRANSPORTING NO FIELDS WHERE type = 'A' OR type = 'E'.
    EXIT.
  ENDLOOP.
END-OF-DEFINITION.`;

    // the result should not depend on the order the files are added in
    for (const files of [
      [new MemoryFile(`zcl_parser_error_test.clas.abap`, main), new MemoryFile(`zcl_parser_error_test.clas.macros.abap`, macros)],
      [new MemoryFile(`zcl_parser_error_test.clas.macros.abap`, macros), new MemoryFile(`zcl_parser_error_test.clas.abap`, main)],
    ]) {
      const reg = new Registry().addFiles(files);
      const issues = reg.findIssues().filter(i => i.getKey() === "parser_error" || i.getKey() === "structure");
      expect(issues.map(i => i.getMessage()).join(", ")).to.equal("");
    }
  });

});