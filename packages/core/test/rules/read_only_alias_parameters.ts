import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

const parameters = `IMPORTING protected TYPE ty_pointer
      CHANGING first TYPE ty_pointer second TYPE ty_pointer`;
const prefix = `DATA(pointer) = REF #( mutable_items ).
    DATA(saved) = REF #( owner->items ).`;

function run(body: string, implementation = "first = protected. SORT second->*.",
             signature = parameters, extraDefinition = "", extraImplementation = "", forms = "") {
  const abap = `CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
TYPES ty_pointer TYPE REF TO lcl_owner=>ty_items.
TYPES: BEGIN OF ty_holder,
         pointer TYPE ty_pointer,
       END OF ty_holder.
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    METHODS run.
    CLASS-METHODS mutate ${signature}.
    ${extraDefinition}
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    DATA mutable_items TYPE lcl_owner=>ty_items.
    ${body}
  ENDMETHOD.
  METHOD mutate.
    ${implementation}
  ENDMETHOD.
  ${extraImplementation}
ENDCLASS.
${forms}`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_alias_parameters.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, overlapping procedure arguments", () => {
  it("follows a reference cell shared by two CHANGING parameters and keeps its output", () => {
    const issues = run(prefix + `
    mutate( EXPORTING protected = saved CHANGING first = pointer second = pointer ).
    SORT pointer->*.`);
    expect(issues).to.have.length(2);
    expect(issues.some(i => i.getSeverity() === Severity.Warning)).to.equal(true);
  });

  it("allows overlapping arguments when all reference targets are writable", () => {
    expect(run(`DATA(pointer) = REF #( mutable_items ).
    mutate( EXPORTING protected = pointer CHANGING first = pointer second = pointer ).
    SORT pointer->*.`)).to.deep.equal([]);
  });

  it("keeps separate actual reference cells independent", () => {
    const issues = run(prefix + `
    DATA(other) = REF #( mutable_items ).
    mutate( EXPORTING protected = saved CHANGING first = pointer second = other ).
    SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("reads a protected reference passed through an ordinary CHANGING target", () => {
    const issues = run(prefix + `
    mutate( EXPORTING protected = saved CHANGING first = pointer second = saved ).`, "SORT second->*.");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  for (const implementation of ["second = writable. first = protected.", "first = protected. second = writable."]) {
    it(`joins outputs for a shared actual cell after ${implementation}`, () => {
      const issues = run(prefix + `
    mutate( EXPORTING protected = saved writable = REF #( mutable_items )
      CHANGING first = pointer second = pointer ).
    SORT pointer->*.`, implementation, parameters.replace("CHANGING", "writable TYPE ty_pointer CHANGING"));
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Warning);
    });
  }

  it("follows an updated actual cell observed through an IMPORTING reference", () => {
    const issues = run(prefix + `
    mutate( EXPORTING protected = saved second = pointer CHANGING first = pointer ).`,
                       "first = protected. SORT second->*.",
                       "IMPORTING protected TYPE ty_pointer second TYPE ty_pointer CHANGING first TYPE ty_pointer");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("closes updates shared by three formal parameters", () => {
    const issues = run(prefix + `
    mutate( EXPORTING protected = saved CHANGING first = pointer second = pointer third = pointer ).
    SORT pointer->*.`, "first = protected. second = first. SORT third->*.",
                       parameters + " third TYPE ty_pointer");
    expect(issues).to.have.length(2);
    expect(issues.some(i => i.getSeverity() === Severity.Warning)).to.equal(true);
  });

  it("matches an aggregate parameter component to a separate reference parameter", () => {
    const issues = run(`DATA holder TYPE ty_holder.
    holder-pointer = REF #( mutable_items ).
    DATA(saved) = REF #( owner->items ).
    mutate( EXPORTING protected = saved CHANGING first = holder second = holder-pointer ).
    SORT holder-pointer->*.`, "first-pointer = protected. SORT second->*.",
                       parameters.replace("first TYPE ty_pointer", "first TYPE ty_holder"));
    expect(issues).to.have.length(2);
    expect(issues.some(i => i.getSeverity() === Severity.Warning)).to.equal(true);
  });

  it("retains overlapping argument effects through another resolved call", () => {
    const issues = run(prefix + `
    mutate( EXPORTING protected = saved CHANGING first = pointer second = pointer ).
    SORT pointer->*.`,
                       "relay( EXPORTING protected = protected CHANGING first = first second = second ).",
                       parameters, "CLASS-METHODS relay " + parameters + ".",
                       "METHOD relay. first = protected. SORT second->*. ENDMETHOD.");
    expect(issues).to.have.length(2);
    expect(issues.some(i => i.getSeverity() === Severity.Warning)).to.equal(true);
  });

  it("copies a VALUE CHANGING output back after the other formal has been read", () => {
    const issues = run(prefix + `
    mutate( EXPORTING protected = saved CHANGING first = pointer second = pointer ).
    SORT pointer->*.`, "first = protected. SORT second->*.",
                       parameters.replace("CHANGING first", "CHANGING VALUE(first)"));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("initializes a VALUE EXPORTING parameter before copying its unchanged result back", () => {
    expect(run(`DATA(pointer) = REF #( owner->items ).
    mutate( IMPORTING first = pointer ).
    SORT pointer->*.`, "", "EXPORTING VALUE(first) TYPE ty_pointer")).to.deep.equal([]);
  });

  it("does not read the old actual through an uninitialized VALUE EXPORTING parameter", () => {
    expect(run(`DATA(pointer) = REF #( owner->items ).
    mutate( IMPORTING first = pointer ).`, "SORT first->*.",
               "EXPORTING VALUE(first) TYPE ty_pointer")).to.deep.equal([]);
  });

  it("preserves the old actual when an EXPORTING reference parameter is unchanged", () => {
    const issues = run(`DATA(pointer) = REF #( owner->items ).
    mutate( IMPORTING first = pointer ).
    SORT pointer->*.`, "", "EXPORTING first TYPE ty_pointer");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("reads the old actual through an EXPORTING reference parameter", () => {
    const issues = run(`DATA(pointer) = REF #( owner->items ).
    mutate( IMPORTING first = pointer ).`, "SORT first->*.", "EXPORTING first TYPE ty_pointer");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("preserves the input of an unchanged VALUE CHANGING parameter", () => {
    const issues = run(`DATA(pointer) = REF #( owner->items ).
    mutate( CHANGING first = pointer ).
    SORT pointer->*.`, "", "CHANGING VALUE(first) TYPE ty_pointer");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("follows overlapping FORM parameters", () => {
    const issues = run(prefix + `
    PERFORM redirect USING saved CHANGING pointer pointer.
    SORT pointer->*.`, "", parameters, "", "", `FORM redirect USING protected TYPE ty_pointer
  CHANGING first TYPE ty_pointer second TYPE ty_pointer.
  first = protected.
  SORT second->*.
ENDFORM.`);
    expect(issues).to.have.length(2);
    expect(issues.some(i => i.getSeverity() === Severity.Warning)).to.equal(true);
  });
});
