import {expect} from "chai";
import {runProgram} from "./syntax";
import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Position} from "../../../src/position";

function typeOf(code: string, name: string): string | undefined {
  const filename = "zfoobar.prog.abap";
  const reg = new Registry().addFile(new MemoryFile(filename, code)).parse();
  const obj = reg.getFirstObject() as ABAPObject;
  const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(new Position(1, 1), filename);
  return scope?.findVariable(name)?.getType().toABAP();
}

describe("syntax.ts, type of a number literal", () => {
  const types: {literal: string, type: string}[] = [
    {literal: "0", type: "i"},
    {literal: "2147483647", type: "i"},
    {literal: "-2147483648", type: "i"},
    {literal: "0000000000000000000000000000001", type: "i"},
    {literal: "2147483648", type: "p LENGTH 8 DECIMALS 0"},
    {literal: "+2147483648", type: "p LENGTH 8 DECIMALS 0"},
    {literal: "-2147483649", type: "p LENGTH 8 DECIMALS 0"},
    {literal: "999999999999999", type: "p LENGTH 8 DECIMALS 0"},
    {literal: "-999999999999999", type: "p LENGTH 8 DECIMALS 0"},
    {literal: "000000000000002147483648", type: "p LENGTH 8 DECIMALS 0"},
    {literal: "1000000000000000", type: "p LENGTH 16 DECIMALS 0"},
    {literal: "9223372036854775807", type: "p LENGTH 16 DECIMALS 0"},
    {literal: "-1234567890123456789012345678901", type: "p LENGTH 16 DECIMALS 0"},
  ];

  for (const t of types) {
    it(`DATA(y) = ${t.literal} is ${t.type}`, () => {
      expect(typeOf(`DATA(y) = ${t.literal}.`, "y")).to.equal(t.type);
    });
  }

  it("calculation with a literal beyond the range of i is p", () => {
    expect(typeOf(`DATA i TYPE i.\nDATA(y) = i + 2147483648.`, "y")).to.equal("p LENGTH 8 DECIMALS 0");
  });

  const prefix = `
TYPES p4 TYPE p LENGTH 4 DECIMALS 0.
TYPES p8 TYPE p LENGTH 8 DECIMALS 0.
TYPES p16 TYPE p LENGTH 16 DECIMALS 0.
TYPES p162 TYPE p LENGTH 16 DECIMALS 2.
TYPES: BEGIN OF ty_struc,
         field TYPE c LENGTH 20,
       END OF ty_struc.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS m_i IMPORTING v TYPE i.
    CLASS-METHODS m_int8 IMPORTING v TYPE int8.
    CLASS-METHODS m_p4 IMPORTING v TYPE p4.
    CLASS-METHODS m_p16 IMPORTING v TYPE p16.
    CLASS-METHODS m_p162 IMPORTING v TYPE p162.
    CLASS-METHODS m_p IMPORTING v TYPE p.
    CLASS-METHODS m_f IMPORTING v TYPE f.
    CLASS-METHODS m_df34 IMPORTING v TYPE decfloat34.
    CLASS-METHODS m_n IMPORTING v TYPE n.
    CLASS-METHODS m_numeric IMPORTING v TYPE numeric.
    CLASS-METHODS m_any IMPORTING v TYPE any.
    CLASS-METHODS m_simple IMPORTING v TYPE simple.
    CLASS-METHODS m_c IMPORTING v TYPE c.
    CLASS-METHODS m_clike IMPORTING v TYPE clike.
    CLASS-METHODS m_d IMPORTING v TYPE d.
    CLASS-METHODS m_string IMPORTING v TYPE string.
    CLASS-METHODS m_csequence IMPORTING v TYPE csequence.
    CLASS-METHODS m_x IMPORTING v TYPE x.
    CLASS-METHODS m_xstring IMPORTING v TYPE xstring.
    CLASS-METHODS m_struc IMPORTING v TYPE ty_struc.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD m_i.
  ENDMETHOD.
  METHOD m_int8.
  ENDMETHOD.
  METHOD m_p4.
  ENDMETHOD.
  METHOD m_p16.
  ENDMETHOD.
  METHOD m_p162.
  ENDMETHOD.
  METHOD m_p.
  ENDMETHOD.
  METHOD m_f.
  ENDMETHOD.
  METHOD m_df34.
  ENDMETHOD.
  METHOD m_n.
  ENDMETHOD.
  METHOD m_numeric.
  ENDMETHOD.
  METHOD m_any.
  ENDMETHOD.
  METHOD m_simple.
  ENDMETHOD.
  METHOD m_c.
  ENDMETHOD.
  METHOD m_clike.
  ENDMETHOD.
  METHOD m_d.
  ENDMETHOD.
  METHOD m_string.
  ENDMETHOD.
  METHOD m_csequence.
  ENDMETHOD.
  METHOD m_x.
  ENDMETHOD.
  METHOD m_xstring.
  ENDMETHOD.
  METHOD m_struc.
  ENDMETHOD.
ENDCLASS.

DATA i TYPE i.
DATA int8 TYPE int8.
DATA struc TYPE ty_struc.

START-OF-SELECTION.`;

  const okay: string[] = [
    `i = 2147483648.`,
    `int8 = 9223372036854775807.`,
    `struc = 2147483648.`,
    `IF i = 2147483648. ENDIF.`,
    `lcl=>m_i( 2147483648 ).`,
    `lcl=>m_int8( 9223372036854775807 ).`,
    `lcl=>m_p4( 2147483648 ).`,
    `lcl=>m_p16( 2147483648 ).`,
    `lcl=>m_p( 2147483648 ).`,
    `lcl=>m_f( 2147483648 ).`,
    `lcl=>m_df34( 2147483648 ).`,
    `lcl=>m_n( 2147483648 ).`,
    `lcl=>m_numeric( 2147483648 ).`,
    `lcl=>m_any( 2147483648 ).`,
    `lcl=>m_simple( 2147483648 ).`,
    `DATA tab TYPE STANDARD TABLE OF p8.
     INSERT 2147483648 INTO TABLE tab.`,
    `DATA tab TYPE SORTED TABLE OF int8 WITH UNIQUE KEY table_line.
     INSERT i + 2147483648 INTO TABLE tab.`,
    `DATA tab TYPE STANDARD TABLE OF i.
     APPEND 2147483648 TO tab.`,
    `TYPES tab TYPE STANDARD TABLE OF p8 WITH EMPTY KEY.
     DATA(v) = VALUE tab( ( 2147483648 ) ).`,
  ];

  for (const code of okay) {
    it("okay, " + code, () => {
      const issues = runProgram(prefix + "\n  " + code);
      expect(issues.length).to.equal(0, issues.map(i => i.getMessage()).join(", "));
    });
  }

  const errors: string[] = [
    `lcl=>m_p162( 2147483648 ).`,
    `lcl=>m_c( 2147483648 ).`,
    `lcl=>m_clike( 2147483648 ).`,
    `lcl=>m_d( 2147483648 ).`,
    `lcl=>m_string( 2147483648 ).`,
    `lcl=>m_csequence( 2147483648 ).`,
    `lcl=>m_x( 2147483648 ).`,
    `lcl=>m_xstring( 2147483648 ).`,
    `lcl=>m_struc( 2147483648 ).`,
    `DATA tab TYPE STANDARD TABLE OF i.
     INSERT 2147483648 INTO TABLE tab.`,
    `DATA tab TYPE SORTED TABLE OF int8 WITH UNIQUE KEY table_line.
     INSERT 9223372036854775807 INTO TABLE tab.`,
    `TYPES tab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
     DATA(v) = VALUE tab( ( 2147483648 ) ).`,
    `TYPES tab TYPE STANDARD TABLE OF int8 WITH EMPTY KEY.
     DATA(v) = VALUE tab( ( 9223372036854775807 ) ).`,
    `TYPES tab TYPE STANDARD TABLE OF f WITH EMPTY KEY.
     DATA(v) = VALUE tab( ( 2147483648 ) ).`,
    `TYPES tab TYPE STANDARD TABLE OF decfloat34 WITH EMPTY KEY.
     DATA(v) = VALUE tab( ( 2147483648 ) ).`,
  ];

  for (const code of errors) {
    it("error, " + code, () => {
      const issues = runProgram(prefix + "\n  " + code);
      expect(issues.length).to.equal(1, issues.map(i => i.getMessage()).join(", "));
    });
  }
});
