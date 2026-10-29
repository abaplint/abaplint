import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function run(body: string, protectedStorage: boolean) {
  const abap = `CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
CLASS lcl_box DEFINITION FINAL.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_holder, pointer TYPE REF TO lcl_owner=>ty_items, END OF ty_holder.
    TYPES: BEGIN OF ty_nested, holder TYPE ty_holder, END OF ty_nested.
    TYPES ty_holders TYPE STANDARD TABLE OF ty_holder WITH DEFAULT KEY.
    DATA holder TYPE ty_holder.
    DATA holders TYPE ty_holders.
    CLASS-DATA saved TYPE ty_holder.
    CLASS-METHODS create IMPORTING pointer TYPE REF TO lcl_owner=>ty_items
      RETURNING VALUE(result) TYPE REF TO lcl_box.
    METHODS clone_holder RETURNING VALUE(result) TYPE ty_holder.
    METHODS clone_holders RETURNING VALUE(result) TYPE ty_holders.
    CLASS-METHODS clone_saved RETURNING VALUE(result) TYPE ty_holder.
    CLASS-METHODS address IMPORTING pointer TYPE REF TO lcl_owner=>ty_items
      RETURNING VALUE(result) TYPE REF TO ty_nested.
ENDCLASS.
CLASS lcl_box IMPLEMENTATION.
  METHOD create.
    CREATE OBJECT result.
    result->holder-pointer = pointer.
  ENDMETHOD.
  METHOD clone_holder. result = holder. ENDMETHOD.
  METHOD clone_holders. result = holders. ENDMETHOD.
  METHOD clone_saved. result = saved. ENDMETHOD.
  METHOD address.
    DATA local TYPE ty_nested.
    local-holder-pointer = pointer.
    GET REFERENCE OF local INTO result.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    DATA mutable TYPE lcl_owner=>ty_items.
    DATA(protected_guard) = REF #( owner->items ).
    DATA(pointer) = REF #( ${protectedStorage ? "owner->items" : "mutable"} ).
    DATA box TYPE REF TO lcl_box.
    CREATE OBJECT box.
    box->holders = VALUE #( ( pointer = pointer ) ).
    lcl_box=>saved-pointer = pointer.
    ${body}
  ENDMETHOD.
ENDCLASS.`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_paths.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, copied attribute paths", () => {
  for (const protectedStorage of [true, false]) {
    it(`resolves a literal component containing a ${protectedStorage ? "protected" : "writable"} reference`, () => {
      const issues = run(`FIELD-SYMBOLS <component> TYPE REF TO lcl_owner=>ty_items.
        ASSIGN COMPONENT 'pointer' OF STRUCTURE lcl_box=>saved TO <component>.
        SORT <component>->*.`, protectedStorage);
      expect(issues.map(i => i.getSeverity())).to.deep.equal(protectedStorage ? [Severity.Error] : []);
    });
  }

  it("resolves a literal component ordinal", () => {
    const issues = run(`FIELD-SYMBOLS <component> TYPE REF TO lcl_owner=>ty_items.
      ASSIGN COMPONENT 1 OF STRUCTURE lcl_box=>saved TO <component>.
      SORT <component>->*.`, true);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Error]);
  });

  it("resolves a nested literal component", () => {
    const issues = run(`DATA nested TYPE lcl_box=>ty_nested.
      nested-holder = lcl_box=>saved.
      FIELD-SYMBOLS <component> TYPE REF TO lcl_owner=>ty_items.
      ASSIGN COMPONENT 'holder-pointer' OF STRUCTURE nested TO <component>.
      SORT <component>->*.`, true);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Error]);
  });

  it("keeps possible protection for an unknown component selector", () => {
    const issues = run(`DATA component TYPE string.
      FIELD-SYMBOLS <component> TYPE REF TO lcl_owner=>ty_items.
      ASSIGN COMPONENT component OF STRUCTURE lcl_box=>saved TO <component>.
      SORT <component>->*.`, true);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Warning]);
  });

  it("replaces a prior binding when a literal component is known to exist", () => {
    expect(run(`DATA local TYPE lcl_box=>ty_holder.
      local-pointer = REF #( mutable ).
      ASSIGN lcl_box=>saved-pointer TO FIELD-SYMBOL(<component>).
      ASSIGN COMPONENT 'pointer' OF STRUCTURE local TO <component>.
      SORT <component>->*.`, true)).to.deep.equal([]);
  });

  const cases = [
    {name: "an instance table attribute", body: "DATA(copy) = box->holders. SORT copy[ 1 ]-pointer->*."},
    {name: "a static structure attribute", body: "DATA(copy) = lcl_box=>saved. SORT copy-pointer->*."},
    {name: "an attribute of a returned object", body: "DATA(copy) = lcl_box=>create( pointer )->holder. SORT copy-pointer->*."},
    {name: "a structure returned by a chained instance call", body: "DATA(copy) = lcl_box=>create( pointer )->clone_holder( ). SORT copy-pointer->*."},
    {name: "a table returned by an instance call", body: "DATA(copy) = box->clone_holders( ). SORT copy[ 1 ]-pointer->*."},
    {name: "a structure returned by a static call", body: "DATA(copy) = lcl_box=>clone_saved( ). SORT copy-pointer->*."},
    {name: "a component of a returned structure reference", body: "DATA(address) = lcl_box=>address( pointer ). DATA(copy) = address->holder. SORT copy-pointer->*."},
  ];
  for (const test of cases) {
    for (const protectedStorage of [true, false]) {
      it(`${protectedStorage ? "protects readonly" : "allows writable"} reference components copied from ${test.name}`, () => {
        const issues = run(test.body, protectedStorage);
        expect(issues.map(i => i.getSeverity())).to.deep.equal(protectedStorage ? [Severity.Error] : []);
        if (protectedStorage) {
          expect(issues[0].getMessage()).to.include("read-only storage");
        }
      });
    }
  }
});
