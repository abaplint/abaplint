import {expect} from "chai";
import {runProgram} from "./syntax";

const message = "Class based exceptions cannot be raised in methods with classic exceptions";

function run(definition: string, implementation: string): string[] {
  const abap = `
INTERFACE lif_classic.
  METHODS run EXCEPTIONS failed.
ENDINTERFACE.

CLASS lcl_super DEFINITION.
  PUBLIC SECTION.
    METHODS classic EXCEPTIONS failed.
ENDCLASS.

CLASS lcl_super IMPLEMENTATION.
  METHOD classic.
  ENDMETHOD.
ENDCLASS.

CLASS lcl_run DEFINITION INHERITING FROM lcl_super.
  PUBLIC SECTION.
${definition}
ENDCLASS.

CLASS lcl_run IMPLEMENTATION.
${implementation}
ENDCLASS.`;
  return runProgram(abap).map(i => i.getMessage());
}

describe("syntax, class based exceptions in a method with classic exceptions", () => {

  const errors: {definition: string, implementation: string}[] = [
    {definition: `CLASS-METHODS run EXCEPTIONS failed.`,
      implementation: `METHOD run.
    RAISE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
    {definition: `METHODS run IMPORTING iv TYPE i EXCEPTIONS failed.`,
      implementation: `METHOD run.
    IF iv = 1.
      RAISE failed.
    ENDIF.
    RAISE RESUMABLE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
    {definition: `METHODS run EXCEPTIONS failed.`,
      implementation: `METHOD run.
    DATA lx TYPE REF TO cx_sy_zerodivide.
    RAISE EXCEPTION lx.
  ENDMETHOD.`},
    {definition: `METHODS run IMPORTING iv TYPE i EXCEPTIONS failed.`,
      implementation: `METHOD run.
    DATA(lv) = COND i( WHEN iv = 1 THEN 2 ELSE THROW cx_sy_zerodivide( ) ).
  ENDMETHOD.`},
    {definition: `METHODS run IMPORTING iv TYPE i EXCEPTIONS failed.`,
      implementation: `METHOD run.
    DATA(lv) = SWITCH i( iv WHEN 1 THEN 2 ELSE THROW cx_sy_zerodivide( ) ).
  ENDMETHOD.`},
    {definition: `INTERFACES lif_classic.`,
      implementation: `METHOD lif_classic~run.
    RAISE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
    {definition: `METHODS classic REDEFINITION.`,
      implementation: `METHOD classic.
    RAISE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
  ];

  for (const e of errors) {
    it("error: " + (e.definition + " " + e.implementation).replace(/\s+/g, " "), () => {
      expect(run(e.definition, e.implementation)).to.deep.equal([message]);
    });
  }

  const ok: {definition: string, implementation: string}[] = [
    {definition: `METHODS run EXCEPTIONS failed.`,
      implementation: `METHOD run.
    RAISE failed.
  ENDMETHOD.`},
    {definition: `METHODS run EXCEPTIONS failed.\n    METHODS stop.`,
      implementation: `METHOD run.
    stop( ).
  ENDMETHOD.
  METHOD stop.
    RAISE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
    {definition: `METHODS run.`,
      implementation: `METHOD run.
    RAISE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
    {definition: `METHODS run RAISING cx_sy_zerodivide.`,
      implementation: `METHOD run.
    RAISE EXCEPTION TYPE cx_sy_zerodivide.
  ENDMETHOD.`},
    {definition: `METHODS run IMPORTING iv TYPE i.`,
      implementation: `METHOD run.
    DATA(lv) = COND i( WHEN iv = 1 THEN 2 ELSE THROW cx_sy_zerodivide( ) ).
  ENDMETHOD.`},
  ];

  for (const e of ok) {
    it("ok: " + (e.definition + " " + e.implementation).replace(/\s+/g, " "), () => {
      expect(run(e.definition, e.implementation)).to.deep.equal([]);
    });
  }

  it("ok: RAISE EXCEPTION in a FORM", () => {
    const abap = `
FORM run.
  RAISE EXCEPTION TYPE cx_sy_zerodivide.
ENDFORM.`;
    expect(runProgram(abap).map(i => i.getMessage())).to.deep.equal([]);
  });

});
