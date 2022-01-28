import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src";

describe("cross object macros", () => {

  it.only("Stupid macros", () => {
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
    const issues = reg.findIssues();

    console.dir(issues);
    expect(issues.length).to.equal(0);
  });

});