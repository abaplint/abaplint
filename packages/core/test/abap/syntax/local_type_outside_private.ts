import {expect} from "chai";
import {runMulti} from "./syntax";

const localsDef = `
TYPES: BEGIN OF ty_s_row,
         id TYPE i,
       END OF ty_s_row.
TYPES ty_t_row TYPE STANDARD TABLE OF ty_s_row WITH EMPTY KEY.
CLASS lcx_local DEFINITION.
ENDCLASS.
CLASS lcl_helper DEFINITION.
  PUBLIC SECTION.
    TYPES ty_i TYPE i.
    CONSTANTS c_one TYPE i VALUE 1.
ENDCLASS.
CLASS lcl_deferred DEFINITION DEFERRED.
INTERFACE lif_local.
ENDINTERFACE.`;

const localsImp = `
TYPES ty_imp TYPE i.
CLASS lcx_local IMPLEMENTATION.
ENDCLASS.
CLASS lcl_helper IMPLEMENTATION.
ENDCLASS.
CLASS lcl_deferred DEFINITION.
ENDCLASS.
CLASS lcl_deferred IMPLEMENTATION.
ENDCLASS.`;

function run(definition: string, implementation = "", def = localsDef, header = "PUBLIC CREATE PUBLIC"): string[] {
  const main = `
CLASS zcl_local_types DEFINITION ${header}.
${definition}
ENDCLASS.

CLASS zcl_local_types IMPLEMENTATION.
${implementation}
ENDCLASS.`;
  const other = `
CLASS zcl_other DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES ty_other TYPE i.
ENDCLASS.
CLASS zcl_other IMPLEMENTATION.
ENDCLASS.`;
  return runMulti([
    {filename: "zcl_local_types.clas.locals_def.abap", contents: def},
    {filename: "zcl_local_types.clas.locals_imp.abap", contents: localsImp},
    {filename: "zcl_local_types.clas.abap", contents: main},
    {filename: "zcl_other.clas.abap", contents: other},
  ]).map(i => i.getMessage());
}

const message = (name: string, section: string) =>
  `"${name}" is local to the class pool and cannot be used in the ${section} SECTION of the global class`;

describe("syntax, local types of the class pool outside the PRIVATE SECTION of the global class", () => {

  const errors: {abap: string, implementation?: string, expected: string[]}[] = [
    {abap: `PUBLIC SECTION.
    DATA mt_row TYPE ty_t_row.`, expected: [message("TY_T_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    DATA mo_helper TYPE REF TO lcl_helper.`, expected: [message("LCL_HELPER", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    DATA mi_local TYPE REF TO lif_local.`, expected: [message("LIF_LOCAL", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    CLASS-DATA gs_row TYPE ty_s_row.`, expected: [message("TY_S_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    CONSTANTS c_id TYPE ty_s_row-id VALUE 1.`, expected: [message("TY_S_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    TYPES ty_pub TYPE ty_s_row.`, expected: [message("TY_S_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    TYPES ty_refs TYPE STANDARD TABLE OF REF TO lcl_helper WITH EMPTY KEY.`, expected: [message("LCL_HELPER", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    TYPES BEGIN OF ty_inc.
    INCLUDE TYPE ty_s_row.
    TYPES END OF ty_inc.`, expected: [message("TY_S_ROW", "PUBLIC")]},
    // one issue per statement
    {abap: `PUBLIC SECTION.
    DATA mv_i TYPE lcl_helper=>ty_i.`, expected: [message("LCL_HELPER", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    DATA: mv_a TYPE ty_s_row,
          mv_b TYPE ty_t_row.`, expected: [message("TY_S_ROW", "PUBLIC"), message("TY_T_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    METHODS run IMPORTING is_row TYPE ty_s_row.`, implementation: `METHOD run.
  ENDMETHOD.`, expected: [message("TY_S_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    METHODS get RETURNING VALUE(ro_helper) TYPE REF TO lcl_helper.`, implementation: `METHOD get.
  ENDMETHOD.`, expected: [message("LCL_HELPER", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    CLASS-METHODS run EXPORTING et_row TYPE ty_t_row RAISING lcx_local.`, implementation: `METHOD run.
  ENDMETHOD.`, expected: [message("TY_T_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    METHODS run RAISING lcx_local.`, implementation: `METHOD run.
  ENDMETHOD.`, expected: [message("LCX_LOCAL", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    METHODS run IMPORTING iv TYPE i DEFAULT lcl_helper=>c_one.`, implementation: `METHOD run.
  ENDMETHOD.`, expected: [message("LCL_HELPER", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    EVENTS changed EXPORTING VALUE(es_row) TYPE ty_s_row.`, expected: [message("TY_S_ROW", "PUBLIC")]},
    {abap: `PUBLIC SECTION.
    INTERFACES lif_local.`, expected: [message("LIF_LOCAL", "PUBLIC")]},
    // DEFINITION DEFERRED in locals_def, defined in locals_imp
    {abap: `PUBLIC SECTION.
    DATA mo_deferred TYPE REF TO lcl_deferred.`, expected: [message("LCL_DEFERRED", "PUBLIC")]},
    // a type of locals_imp, unknown in the class definition on the system
    {abap: `PUBLIC SECTION.
    DATA mv_imp TYPE ty_imp.`, expected: [message("TY_IMP", "PUBLIC")]},
    {abap: `PROTECTED SECTION.
    DATA mv_row TYPE ty_s_row.`, expected: [message("TY_S_ROW", "PROTECTED")]},
    {abap: `PROTECTED SECTION.
    METHODS run CHANGING ct_row TYPE ty_t_row.`, implementation: `METHOD run.
  ENDMETHOD.`, expected: [message("TY_T_ROW", "PROTECTED")]},
    {abap: `PUBLIC SECTION.
    DATA mt_row TYPE ty_t_row.
  PROTECTED SECTION.
    DATA mo_helper TYPE REF TO lcl_helper.
  PRIVATE SECTION.
    DATA mv_row TYPE ty_s_row.`, expected: [message("TY_T_ROW", "PUBLIC"), message("LCL_HELPER", "PROTECTED")]},
  ];

  for (const e of errors) {
    it("error: " + e.abap.replace(/\s+/g, " "), () => {
      expect(run(e.abap, e.implementation)).to.deep.equal(e.expected);
    });
  }

  it("error: PUBLIC SECTION of a FINAL class", () => {
    const abap = `PUBLIC SECTION.
    DATA mv_row TYPE ty_s_row.
  PROTECTED SECTION.
    DATA mv_prot TYPE ty_s_row.`;
    expect(run(abap, "", localsDef, "PUBLIC FINAL CREATE PUBLIC")).to.deep.equal([message("TY_S_ROW", "PUBLIC")]);
  });

  it("fine: PROTECTED SECTION of a FINAL class", () => {
    const abap = `PUBLIC SECTION.
  PROTECTED SECTION.
    DATA foo TYPE ty.
  PRIVATE SECTION.`;
    const def = localsDef + `
TYPES ty TYPE i.`;
    expect(run(abap, "", def, "PUBLIC FINAL CREATE PUBLIC")).to.deep.equal([]);
  });

  const fine: {abap: string, implementation?: string}[] = [
    {abap: `PRIVATE SECTION.
    DATA mt_row TYPE ty_t_row.
    DATA mo_helper TYPE REF TO lcl_helper.
    DATA mi_local TYPE REF TO lif_local.
    CONSTANTS c_id TYPE ty_s_row-id VALUE lcl_helper=>c_one.
    TYPES ty_priv TYPE STANDARD TABLE OF REF TO lcl_helper WITH EMPTY KEY.
    METHODS run IMPORTING is_row TYPE ty_s_row RETURNING VALUE(rt_row) TYPE ty_t_row RAISING lcx_local.`,
    implementation: `METHOD run.
  ENDMETHOD.`},
    // DEFINITION DEFERRED in locals_def, used in the PRIVATE SECTION
    {abap: `PRIVATE SECTION.
    DATA mo_deferred TYPE REF TO lcl_deferred.`},
    // local types inside the implementation of a PUBLIC method
    {abap: `PUBLIC SECTION.
    METHODS run.`, implementation: `METHOD run.
    DATA lt_row TYPE ty_t_row.
    DATA lo_helper TYPE REF TO lcl_helper.
    lo_helper = NEW #( ).
    CLEAR lt_row.
  ENDMETHOD.`},
    // types of the global class itself, of other global classes, built-in and void types
    {abap: `PUBLIC SECTION.
    TYPES ty_own TYPE i.
    TYPES ty_own_tab TYPE STANDARD TABLE OF ty_own WITH EMPTY KEY.
    DATA mv_own TYPE zcl_local_types=>ty_own.
    DATA mv_other TYPE zcl_other=>ty_other.
    DATA mo_other TYPE REF TO zcl_other.
    DATA mv_string TYPE string.
    DATA mv_void TYPE matnr.
    DATA mo_void TYPE REF TO cl_abap_typedescr.
  PROTECTED SECTION.
    DATA mt_own TYPE ty_own_tab.`},
    // a type of locals_imp in the PRIVATE SECTION is not part of this check
    {abap: `PRIVATE SECTION.
    DATA mv_imp TYPE ty_imp.`},
  ];

  for (const f of fine) {
    it("fine: " + f.abap.replace(/\s+/g, " "), () => {
      expect(run(f.abap, f.implementation)).to.deep.equal([]);
    });
  }

  it("fine: a type of the global class used in locals_def", () => {
    const def = localsDef + `
TYPES ty_from_global TYPE zcl_local_types=>ty_own.`;
    const abap = `PUBLIC SECTION.
    TYPES ty_own TYPE i.`;
    expect(run(abap, "", def)).to.deep.equal([]);
  });

  it("fine: a local class of the class pool using local types in its own PUBLIC SECTION", () => {
    const def = localsDef + `
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    DATA mt_row TYPE ty_t_row.
    DATA mo_helper TYPE REF TO lcl_helper.
ENDCLASS.`;
    expect(run(`PUBLIC SECTION.`, "", def)).to.deep.equal([]);
  });

  it("fine: a local class in a program", () => {
    const abap = `
TYPES ty_s_row TYPE i.
CLASS lcl_prog DEFINITION.
  PUBLIC SECTION.
    DATA mv_row TYPE ty_s_row.
ENDCLASS.
CLASS lcl_prog IMPLEMENTATION.
ENDCLASS.`;
    const issues = runMulti([{filename: "zlocal_types.prog.abap", contents: abap}]);
    expect(issues.map(i => i.getMessage())).to.deep.equal([]);
  });

  it("issue position is the local type", () => {
    const main = `CLASS zcl_local_types DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    DATA mo_helper TYPE REF TO lcl_helper.
ENDCLASS.
CLASS zcl_local_types IMPLEMENTATION.
ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_local_types.clas.locals_def.abap", contents: localsDef},
      {filename: "zcl_local_types.clas.abap", contents: main},
    ]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getFilename()).to.equal("zcl_local_types.clas.abap");
    expect(issues[0].getStart().getRow()).to.equal(3);
    expect(issues[0].getStart().getCol()).to.equal(32);
  });

});
