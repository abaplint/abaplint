import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function run(body: string, methods = "", implementation = "", subclass = "") {
  const abap = `CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
TYPES ty_pointer TYPE REF TO lcl_owner=>ty_items.
TYPES: BEGIN OF ty_holder, pointer TYPE ty_pointer, END OF ty_holder.
TYPES ty_pointers TYPE STANDARD TABLE OF ty_pointer WITH DEFAULT KEY.
TYPES ty_holders TYPE STANDARD TABLE OF ty_holder WITH DEFAULT KEY.
CLASS lcl_box DEFINITION.
  PUBLIC SECTION.
    DATA pointer TYPE ty_pointer.
    ${methods}
ENDCLASS.
CLASS lcl_box IMPLEMENTATION.
  ${implementation}
ENDCLASS.
${subclass}
START-OF-SELECTION.
  DATA owner TYPE REF TO lcl_owner.
  DATA mutable TYPE lcl_owner=>ty_items.
  DATA(guard) = REF #( owner->items ).
  ${body}`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_allocations.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, object allocations", () => {
  const allocations = [
    "DATA(first) = NEW lcl_box( ).",
    "DATA first TYPE REF TO lcl_box. first = NEW #( ).",
    "DATA first TYPE REF TO lcl_box. first = NEW lcl_box( ).",
  ];
  for (const allocation of allocations) {
    for (const reversed of [false, true]) {
      for (const selected of ["first", "second"]) {
        it(`keeps ${selected} independent after ${allocation}, reversed=${reversed}`, () => {
          const assignments = ["first->pointer = REF #( owner->items ).", "second->pointer = REF #( mutable )."];
          const issues = run(`${allocation}
            ${allocation.replace(/first/g, "second")}
            ${(reversed ? assignments.reverse() : assignments).join("\n")}
            SORT ${selected}->pointer->*.`);
          expect(issues).to.have.length(selected === "first" ? 1 : 0);
          if (issues.length > 0) {
            expect(issues[0].getSeverity()).to.equal(Severity.Error);
          }
        });
      }
    }
  }

  for (const writable of [false, true]) {
    const source = writable ? "mutable" : "owner->items";
    it(`preserves a copied object reference, writable=${writable}`, () => {
      const issues = run(`DATA(first) = NEW lcl_box( ). DATA(second) = first.
        first->pointer = REF #( ${source} ). SORT second->pointer->*.`);
      expect(issues).to.have.length(writable ? 0 : 1);
    });

    for (const named of [false, true]) {
      it(`applies ${named ? "named" : "unnamed"} constructor arguments, writable=${writable}`, () => {
        const issues = run(`DATA(first) = NEW lcl_box( ${named ? "supplied = " : ""}REF #( ${source} ) ).
          SORT first->pointer->*.`, "METHODS constructor IMPORTING supplied TYPE ty_pointer.",
                           "METHOD constructor. pointer = supplied. ENDMETHOD.");
        expect(issues).to.have.length(writable ? 0 : 1);
        if (issues.length > 0) {
          expect(issues[0].getSeverity()).to.equal(Severity.Error);
        }
      });
    }

    it(`applies an inherited constructor, writable=${writable}`, () => {
      const issues = run(`DATA(first) = NEW lcl_child( REF #( ${source} ) ). SORT first->pointer->*.`,
                         "METHODS constructor IMPORTING supplied TYPE ty_pointer.",
                         "METHOD constructor. pointer = supplied. ENDMETHOD.",
                         "CLASS lcl_child DEFINITION INHERITING FROM lcl_box FINAL. ENDCLASS. CLASS lcl_child IMPLEMENTATION. ENDCLASS.");
      expect(issues).to.have.length(writable ? 0 : 1);
    });

    it(`uses the new object as a chained method receiver, writable=${writable}`, () => {
      const issues = run(`DATA(selected) = NEW lcl_box( REF #( ${source} ) )->get( ). SORT selected->*.`,
                         `METHODS constructor IMPORTING supplied TYPE ty_pointer.
                          METHODS get RETURNING VALUE(result) TYPE ty_pointer.`,
                         `METHOD constructor. pointer = supplied. ENDMETHOD.
                          METHOD get. result = pointer. ENDMETHOD.`);
      expect(issues).to.have.length(writable ? 0 : 1);
    });

    for (const allocator of ["CREATE OBJECT first", "CREATE OBJECT first TYPE lcl_child"]) {
      it(`applies constructor arguments for ${allocator}, writable=${writable}`, () => {
        const issues = run(`DATA first TYPE REF TO lcl_box.
          ${allocator} EXPORTING supplied = REF #( ${source} ). SORT first->pointer->*.`,
                           "METHODS constructor IMPORTING supplied TYPE ty_pointer.",
                           "METHOD constructor. pointer = supplied. ENDMETHOD.",
                           "CLASS lcl_child DEFINITION INHERITING FROM lcl_box FINAL. ENDCLASS. CLASS lcl_child IMPLEMENTATION. ENDCLASS.");
        expect(issues).to.have.length(writable ? 0 : 1);
        if (issues.length > 0) {
          expect(issues[0].getSeverity()).to.equal(Severity.Error);
        }
      });
    }

    const dataAllocations = [
      `DATA(allocated) = NEW ty_pointer( REF #( ${source} ) ). SORT allocated->*->*.`,
      `DATA(allocated) = NEW ty_pointer( REF #( ${source} ) ). DATA(selected) = allocated->*. SORT selected->*.`,
      `DATA allocated TYPE REF TO ty_pointer. allocated = NEW #( REF #( ${source} ) ). SORT allocated->*->*.`,
      `DATA(allocated) = NEW ty_holder( pointer = REF #( ${source} ) ). SORT allocated->pointer->*.`,
      `DATA allocated TYPE REF TO ty_holder. allocated = NEW #( pointer = REF #( ${source} ) ). SORT allocated->pointer->*.`,
      `DATA holder TYPE ty_holder. holder-pointer = REF #( ${source} ).
       DATA(allocated) = NEW ty_holder( holder ). SORT allocated->pointer->*.`,
      `DATA(allocated) = NEW ty_pointers( ( REF #( ${source} ) ) ). SORT allocated->*[ 1 ]->*.`,
      `DATA(allocated) = NEW ty_holders( ( pointer = REF #( ${source} ) ) ). SORT allocated->*[ 1 ]-pointer->*.`,
      `DATA holders TYPE ty_holders. DATA holder TYPE ty_holder. holder-pointer = REF #( ${source} ). APPEND holder TO holders.
       DATA(allocated) = NEW ty_holders( holders ). SORT allocated->*[ 1 ]-pointer->*.`,
    ];
    for (const body of dataAllocations) {
      it(`preserves data-reference constructor contents, writable=${writable}: ${body}`, () => {
        const issues = run(body);
        expect(issues).to.have.length(writable ? 0 : 1);
        if (issues.length > 0) {
          expect(issues[0].getSeverity()).to.equal(Severity.Error);
        }
      });
    }
  }

  it("keeps separate CREATE OBJECT instances independent", () => {
    const issues = run(`DATA first TYPE REF TO lcl_box. DATA second TYPE REF TO lcl_box.
      CREATE OBJECT first EXPORTING supplied = REF #( owner->items ).
      CREATE OBJECT second EXPORTING supplied = REF #( mutable ).
      SORT first->pointer->*. SORT second->pointer->*.`,
                       "METHODS constructor IMPORTING supplied TYPE ty_pointer.",
                       "METHOD constructor. pointer = supplied. ENDMETHOD.");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("starts newly allocated reference cells empty", () => {
    expect(run(`DATA(allocated) = NEW ty_pointer( ). SORT allocated->*->*.
      DATA(holder) = NEW ty_holder( ). SORT holder->pointer->*.`)).to.deep.equal([]);
  });

  it("keeps the allocated reference cell writable independently of its protected pointee", () => {
    expect(run(`DATA(allocated) = NEW ty_pointer( REF #( owner->items ) ).
      CLEAR allocated->*. SORT allocated->*->*.`)).to.deep.equal([]);
  });

  for (const body of [
    `DATA(allocated) = NEW ty_pointers( ( REF #( owner->items ) ) ( REF #( mutable ) ) ). SORT allocated->*[ 1 ]->*.`,
    `DATA(allocated) = NEW ty_holders( ( pointer = REF #( owner->items ) ) ( pointer = REF #( mutable ) ) ).
     SORT allocated->*[ 1 ]-pointer->*.`,
  ]) {
    it(`joins multiple data-constructor rows: ${body}`, () => {
      const issues = run(body);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Warning);
    });
  }

  it("rebases allocated objects returned by separate factory calls", () => {
    const issues = run(`DATA(first) = lcl_box=>make( ). DATA(second) = lcl_box=>make( ).
      first->pointer = REF #( owner->items ). second->pointer = REF #( mutable ). SORT first->pointer->*.`,
                       "CLASS-METHODS make RETURNING VALUE(result) TYPE REF TO lcl_box.",
                       "METHOD make. result = NEW lcl_box( ). ENDMETHOD.");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });
});
