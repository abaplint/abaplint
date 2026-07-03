import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";

// macro defined in one include, used in a sibling include, both included by the same main program
describe("macros via include", () => {

  it("macro defined in TOP include, used in F01 include", async () => {
    const zmain = `REPORT zmacro_main.
INCLUDE zmacro_top.
INCLUDE zmacro_f01.`;

    const ztop = `DATA: BEGIN OF r_mblnr OCCURS 0,
        sign TYPE c LENGTH 1,
        option TYPE c LENGTH 2,
        low TYPE c LENGTH 10,
        high TYPE c LENGTH 10,
      END OF r_mblnr.

DEFINE set_range.
  clear &1.
  &1-sign   = &2.
  &1-option = &3.
  &1-low    = &4.
  &1-high   = &5.
  append &1.
END-OF-DEFINITION.`;

    const zf01 = `FORM bar.
  set_range r_mblnr 'I' 'EQ' 'VAL' ''.
ENDFORM.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zmacro_main.prog.abap", zmain),
      new MemoryFile("zmacro_top.prog.abap", ztop),
      new MemoryFile("zmacro_top.prog.xml", "<SUBC>I</SUBC>"),
      new MemoryFile("zmacro_f01.prog.abap", zf01),
      new MemoryFile("zmacro_f01.prog.xml", "<SUBC>I</SUBC>"),
    ]);

    const issues = reg.parse().findIssues().filter(i => i.getKey() === "parser_error");
    expect(issues.length).to.equal(0);
  });

});
