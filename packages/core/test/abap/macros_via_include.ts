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

  it("macro names must not leak between unrelated main programs", async () => {
    const main1 = `REPORT zmain1.
INCLUDE ztop1.
INCLUDE zf1.`;
    const top1 = `DEFINE macro_a.
  WRITE &1.
END-OF-DEFINITION.`;
    const f1 = `FORM bar1.
  macro_a 'works'.
  macro_b 'parser error, only visible via zmain2'.
ENDFORM.`;

    const main2 = `REPORT zmain2.
INCLUDE ztop2.
INCLUDE zf2.`;
    const top2 = `DEFINE macro_b.
  WRITE &1.
END-OF-DEFINITION.`;
    const f2 = `FORM bar2.
  macro_b 'works'.
ENDFORM.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zmain1.prog.abap", main1),
      new MemoryFile("ztop1.prog.abap", top1),
      new MemoryFile("ztop1.prog.xml", "<SUBC>I</SUBC>"),
      new MemoryFile("zf1.prog.abap", f1),
      new MemoryFile("zf1.prog.xml", "<SUBC>I</SUBC>"),
      new MemoryFile("zmain2.prog.abap", main2),
      new MemoryFile("ztop2.prog.abap", top2),
      new MemoryFile("ztop2.prog.xml", "<SUBC>I</SUBC>"),
      new MemoryFile("zf2.prog.abap", f2),
      new MemoryFile("zf2.prog.xml", "<SUBC>I</SUBC>"),
    ]);

    const issues = reg.parse().findIssues().filter(i => i.getKey() === "parser_error");
    expect(issues.length).to.equal(1);
    expect(issues[0].getFilename()).to.equal("zf1.prog.abap");
  });

});
