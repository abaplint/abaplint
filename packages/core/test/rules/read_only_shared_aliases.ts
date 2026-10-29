import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";
import {ReadOnlyFlow} from "../../src/rules/_read_only_flow";

function withAnalysisLimit(action: () => void): void {
  const prototype = ReadOnlyFlow.prototype as unknown as {analyze: (procedure: unknown) => unknown};
  const original = prototype.analyze;
  let analyses = 0;
  prototype.analyze = function(procedure: unknown) {
    expect(++analyses, "procedure analyses").to.be.at.most(50);
    return original.call(this, procedure);
  };
  try {
    action();
    expect(analyses, "procedure analyses").to.be.greaterThan(0);
  } finally {
    prototype.analyze = original;
  }
}

function run(body: string, implementation: string, extra = "", declarations = "") {
  const abap = `REPORT zread_only_shared_aliases.
CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
TYPES ty_pointer TYPE REF TO lcl_owner=>ty_items.
TYPES: BEGIN OF ty_holder, pointer TYPE ty_pointer, END OF ty_holder.
DATA owner TYPE REF TO lcl_owner.
DATA mutable_items TYPE lcl_owner=>ty_items.
FIELD-SYMBOLS <shared> TYPE lcl_owner=>ty_items.
FIELD-SYMBOLS <other> TYPE lcl_owner=>ty_items.
${declarations}
START-OF-SELECTION.
  CREATE OBJECT owner.
  ${body}
FORM mutate.
  ${implementation}
ENDFORM.
FORM protection_marker.
  DATA pointer TYPE ty_pointer.
  GET REFERENCE OF owner->items INTO pointer.
ENDFORM.
${extra}`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_shared_aliases.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, shared field symbols across procedures", () => {
  it("exports a protected binding established by a FORM", () => {
    const issues = run("ASSIGN mutable_items TO <shared>. PERFORM mutate. SORT <shared>.",
                       "ASSIGN owner->items TO <shared>.");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("replaces the caller's protected binding with a writable binding", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate. SORT <shared>.",
               "ASSIGN mutable_items TO <shared>.")).to.deep.equal([]);
  });

  it("uses the caller's protected binding for callee writes", () => {
    const issues = run("ASSIGN owner->items TO <shared>. PERFORM mutate.", "SORT <shared>.");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("passes a protected binding through nested calls", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate.", "PERFORM nested.",
               "FORM nested. SORT <shared>. ENDFORM.")).to.have.length(1);
  });

  it("exports an UNASSIGN effect", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate. SORT <shared>.",
               "UNASSIGN <shared>.")).to.deep.equal([]);
  });

  it("exports a protected binding through nested calls", () => {
    expect(run("PERFORM mutate. SORT <shared>.", "PERFORM nested.",
               "FORM nested. ASSIGN owner->items TO <shared>. ENDFORM.")).to.have.length(1);
  });

  it("keeps a local field symbol with the same name independent", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate. SORT <shared>.",
               "FIELD-SYMBOLS <shared> TYPE lcl_owner=>ty_items. ASSIGN mutable_items TO <shared>."))
      .to.have.length(1);
  });

  it("substitutes an incoming binding exported under another shared field symbol", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate. SORT <other>.",
               "ASSIGN <shared> TO <other>.")).to.have.length(1);
  });

  it("preserves a shared binding when another shared field symbol is unassigned", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate. SORT <shared>.",
               "UNASSIGN <other>.")).to.have.length(1);
  });

  it("joins a conditional protected rebinding with the caller's writable binding", () => {
    const issues = run("ASSIGN mutable_items TO <shared>. PERFORM mutate. SORT <shared>.",
                       "IF sy-subrc = 0. ASSIGN owner->items TO <shared>. ENDIF.");
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("retains reference components of local storage published through a global field symbol", () => {
    expect(run("PERFORM mutate. SORT <holder>-pointer->*.",
               `DATA holder TYPE ty_holder.
  holder-pointer = REF #( owner->items ).
  ASSIGN holder TO <holder>.`, "", "FIELD-SYMBOLS <holder> TYPE ty_holder.")).to.have.length(1);
  });

  it("substitutes an incoming protected reference cell", () => {
    expect(run(`DATA pointer TYPE ty_pointer. pointer = REF #( owner->items ).
  ASSIGN pointer TO <pointer>. PERFORM mutate.`, "SORT <pointer>->*.", "",
               "FIELD-SYMBOLS <pointer> TYPE ty_pointer.")).to.have.length(1);
  });

  it("uses the caller's protected binding in a resolved method", () => {
    expect(run("ASSIGN owner->items TO <shared>. lcl_user=>mutate( ).", "", "", `
CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS mutate.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD mutate. SORT <shared>. ENDMETHOD.
ENDCLASS.`)).to.have.length(1);
  });

  it("converges for a recursive FORM with a protected binding", () => {
    expect(run("ASSIGN owner->items TO <shared>. PERFORM mutate.",
               "IF sy-subrc = 0. PERFORM mutate. ENDIF. SORT <shared>."))
      .to.have.length(1);
  });

  it("exports reference writes through an incoming shared binding", () => {
    expect(run(`DATA pointer TYPE ty_pointer. pointer = REF #( mutable_items ).
  ASSIGN pointer TO <pointer>. PERFORM mutate. SORT pointer->*.`,
               "<pointer> = REF #( owner->items ).", "", "FIELD-SYMBOLS <pointer> TYPE ty_pointer."))
      .to.have.length(1);
  });

  it("keeps unrelated shared bindings out of an opaque method before a protected write", () => {
    const issues = run("ASSIGN owner->items TO <shared>. external->noop( ). SORT <shared>.", "", "", `
CLASS lcl_external DEFINITION ABSTRACT.
  PUBLIC SECTION.
    METHODS noop ABSTRACT.
ENDCLASS.
CLASS lcl_external IMPLEMENTATION. ENDCLASS.
DATA external TYPE REF TO lcl_external.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  for (const callee of ["mutate", "relay"]) {
    it(`converges when ${callee === "mutate" ? "self" : "mutual"} recursion swaps protected bindings`, () => {
      withAnalysisLimit(() => {
        const issues = run(`ASSIGN owner->items TO <shared>. ASSIGN mutable_items TO <other>.
  PERFORM mutate. SORT <shared>.`, `FIELD-SYMBOLS <temp> TYPE lcl_owner=>ty_items.
  ASSIGN <shared> TO <temp>.
  ASSIGN <other> TO <shared>.
  ASSIGN <temp> TO <other>.
  PERFORM ${callee}.`, callee === "relay" ? "FORM relay. PERFORM mutate. ENDFORM." : "");
        expect(issues).to.have.length(1);
        expect(issues[0].getSeverity()).to.equal(Severity.Warning);
      });
    });
  }

  const referenceCases = [
    {name: "replaces protected reference contents without recursion", source: "owner->items", callee: "", clear: false, count: 0},
    {name: "converges when self recursion swaps protected reference contents",
      source: "owner->items", callee: "mutate", clear: false, count: 1},
    {name: "converges when mutual recursion swaps protected reference contents",
      source: "owner->items", callee: "relay", clear: false, count: 1},
    {name: "converges when self recursion swaps writable reference contents",
      source: "mutable_items", callee: "mutate", clear: false, count: 0},
    {name: "clears protected reference contents during self recursion", source: "owner->items", callee: "mutate", clear: true, count: 0},
  ];
  for (const test of referenceCases) {
    it(test.name, () => {
      withAnalysisLimit(() => {
        const issues = run(`first = REF #( ${test.source} ).
  second = REF #( mutable_items ).
  ASSIGN first TO <first>. ASSIGN second TO <second>.
  PERFORM mutate. SORT first->*.`, `DATA temporary TYPE ty_pointer.
  temporary = <first>. <first> = <second>. <second> = temporary.
  ${test.clear ? "CLEAR <second>." : ""}
  ${test.callee ? `PERFORM ${test.callee}.` : ""}`, "FORM relay. PERFORM mutate. ENDFORM.", `
DATA first TYPE ty_pointer.
DATA second TYPE ty_pointer.
FIELD-SYMBOLS <first> TYPE ty_pointer.
FIELD-SYMBOLS <second> TYPE ty_pointer.`);
        expect(issues).to.have.length(test.count);
        if (test.count > 0) {
          expect(issues[0].getSeverity()).to.equal(Severity.Warning);
        }
      });
    });
  }
});
