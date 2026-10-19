import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function run(body: string) {
  const abap = `
CLASS cx_root DEFINITION. ENDCLASS.
CLASS cx_root IMPLEMENTATION. ENDCLASS.
CLASS cx_no_check DEFINITION INHERITING FROM cx_root. ENDCLASS.
CLASS cx_no_check IMPLEMENTATION. ENDCLASS.
CLASS lcl_error DEFINITION INHERITING FROM cx_no_check. ENDCLASS.
CLASS lcl_error IMPLEMENTATION. ENDCLASS.
CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
    DATA other_items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION.
ENDCLASS.
TYPES ty_pointer TYPE REF TO lcl_owner=>ty_items.
TYPES: BEGIN OF ty_holder,
         pointer TYPE ty_pointer,
         number TYPE i,
       END OF ty_holder.
TYPES: BEGIN OF ty_nested,
         holder TYPE ty_holder,
       END OF ty_nested.
TYPES ty_holders TYPE STANDARD TABLE OF ty_holder WITH DEFAULT KEY.
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    DATA pointer TYPE ty_pointer.
    METHODS run IMPORTING condition TYPE i.
    CLASS-METHODS sort_value IMPORTING VALUE(holder) TYPE ty_holder.
    CLASS-METHODS sort_reference IMPORTING holder TYPE ty_holder.
    CLASS-METHODS identity IMPORTING VALUE(holder) TYPE ty_holder RETURNING VALUE(result) TYPE ty_holder.
    CLASS-METHODS address IMPORTING VALUE(holder) TYPE ty_holder RETURNING VALUE(result) TYPE REF TO ty_holder.
    CLASS-METHODS wrapper IMPORTING VALUE(holder) TYPE ty_holder RETURNING VALUE(result) TYPE REF TO ty_holder.
    CLASS-METHODS ref_address IMPORTING VALUE(pointer) TYPE ty_pointer RETURNING VALUE(result) TYPE REF TO ty_pointer.
    CLASS-METHODS redirect IMPORTING writable TYPE ty_pointer CHANGING pointer TYPE ty_pointer RETURNING VALUE(result) TYPE i.
    CLASS-METHODS mutate IMPORTING pointer TYPE ty_pointer RETURNING VALUE(result) TYPE i.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    DATA mutable TYPE lcl_owner=>ty_items.
    DATA holder TYPE ty_holder.
    DATA number TYPE i.
    ${body}
  ENDMETHOD.
  METHOD sort_value.
    SORT holder-pointer->*.
  ENDMETHOD.
  METHOD sort_reference.
    SORT holder-pointer->*.
  ENDMETHOD.
  METHOD identity.
    result = holder.
  ENDMETHOD.
  METHOD address.
    DATA local TYPE ty_holder.
    local = holder.
    GET REFERENCE OF local INTO result.
  ENDMETHOD.
  METHOD wrapper.
    result = address( holder ).
  ENDMETHOD.
  METHOD ref_address.
    GET REFERENCE OF pointer INTO result.
  ENDMETHOD.
  METHOD redirect.
    pointer = writable.
    result = 1.
  ENDMETHOD.
  METHOD mutate.
    SORT pointer->*.
    result = 1.
  ENDMETHOD.
ENDCLASS.
FORM sort_form USING VALUE(holder) TYPE ty_holder.
  SORT holder-pointer->*.
ENDFORM.`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_values.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, CASE condition effects", () => {
  for (const {target, name} of [{target: "DATA(selected)", name: "selected"}, {target: "casted", name: "casted"}]) {
    it(`preserves object identity through CASE TYPE INTO ${target}`, () => {
      const issues = run(`CREATE OBJECT owner.
      DATA(actual) = NEW lcl_user( ).
      actual->pointer = REF #( owner->items ).
      DATA object TYPE REF TO object.
      DATA casted TYPE REF TO lcl_user.
      object = actual.
      CASE TYPE OF object.
        WHEN TYPE lcl_user INTO ${target}.
          SORT ${name}->pointer->*.
      ENDCASE.`);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Error);
    });
  }

  for (const tail of ["WHEN OTHERS. SORT pointer->*.", "WHEN 2. SORT pointer->*."]) {
    it(`carries an empty WHEN operand's rebinding into ${tail}`, () => {
      const issues = run(`CREATE OBJECT owner.
      DATA(pointer) = REF #( mutable ).
      CASE condition.
        WHEN redirect( EXPORTING writable = REF #( owner->items ) CHANGING pointer = pointer ).
        ${tail}
      ENDCASE.`);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Error);
    });
  }

  it("retains WHEN operand effects on the final no-match path", () => {
    const issues = run(`CREATE OBJECT owner.
    DATA(pointer) = REF #( mutable ).
    CASE condition.
      WHEN redirect( EXPORTING writable = REF #( owner->items ) CHANGING pointer = pointer ).
    ENDCASE.
    SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("isolates matching branch assignments from later WHEN operands", () => {
    expect(run(`CREATE OBJECT owner.
    DATA(pointer) = REF #( mutable ).
    CASE condition.
      WHEN 1.
        pointer = REF #( owner->items ).
      WHEN OTHERS.
        SORT pointer->*.
    ENDCASE.`)).to.deep.equal([]);
  });

  it("joins short-circuited OR operands for the body but evaluates them all before OTHERS", () => {
    const issues = run(`CREATE OBJECT owner.
    DATA(pointer) = REF #( mutable ).
    CASE condition.
      WHEN 1 OR redirect( EXPORTING writable = REF #( owner->items ) CHANGING pointer = pointer ).
        SORT pointer->*.
      WHEN OTHERS.
        SORT pointer->*.
    ENDCASE.`);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Warning, Severity.Error]);
  });
});

describe("Rule: read_only_write, copied values", () => {
  const protectedValues = [
    {name: "reference to a returned local structure", body: `holder-pointer = REF #( owner->items ).
      DATA(pointer) = address( holder ). SORT pointer->*-pointer->*.`},
    {name: "address of a by-value reference cell", body: `DATA(pointer) = REF #( owner->items ).
      DATA(outer) = ref_address( pointer ). SORT outer->*->*.`},
    {name: "reference through a wrapper", body: `holder-pointer = REF #( owner->items ).
      DATA(pointer) = wrapper( holder ). SORT pointer->*-pointer->*.`},
    {name: "LET binding before condition effects", body: `number = COND i( LET selected = REF #( owner->items ) IN
      WHEN mutate( selected ) = 1 THEN 1 ELSE 0 ).`},
    {name: "dereferenced CAST binding", body: `ASSIGN CAST lcl_owner=>ty_items( REF #( owner->items ) )->* TO FIELD-SYMBOL(<items>).
      SORT <items>.`},
    {name: "component of a returned structure", body: `holder-pointer = REF #( owner->items ).
      ASSIGN identity( holder )-pointer->* TO FIELD-SYMBOL(<items>). SORT <items>.`},
    {name: "CAST", body: "DATA(pointer) = CAST lcl_owner=>ty_items( REF #( owner->items ) ). SORT pointer->*."},
    {name: "CAST used directly as a SORT target", body: `DATA(pointer) = REF #( owner->items ).
      SORT CAST lcl_owner=>ty_items( pointer )->*.`},
    {name: "CAST used directly as a CLEAR target", body: `DATA(pointer) = REF #( owner->items ).
      CLEAR CAST lcl_owner=>ty_items( pointer )->*.`},
    {name: "CAST used directly as an assignment target", body: `DATA(pointer) = REF #( owner->items ).
      CAST lcl_owner=>ty_items( pointer )->* = mutable.`},
    {name: "COND", body: `DATA(pointer) = COND ty_pointer( WHEN condition = 1 THEN REF #( owner->items )
      ELSE REF #( owner->other_items ) ). SORT pointer->*.`},
    {name: "SWITCH", body: `DATA(pointer) = SWITCH ty_pointer( condition WHEN 1 THEN REF #( owner->items )
      ELSE REF #( owner->other_items ) ). SORT pointer->*.`},
    {name: "structure copy", body: "holder-pointer = REF #( owner->items ). DATA(copy) = holder. SORT copy-pointer->*."},
    {name: "structure constructor", body: "DATA(copy) = VALUE ty_holder( pointer = REF #( owner->items ) ). SORT copy-pointer->*."},
    {name: "structure BASE", body: `holder-pointer = REF #( owner->items ).
      DATA(copy) = VALUE ty_holder( BASE holder number = 1 ). SORT copy-pointer->*.`},
    {name: "nested structure constructor", body: `DATA(copy) = VALUE ty_nested(
      holder = VALUE #( pointer = REF #( owner->items ) ) ). SORT copy-holder-pointer->*.`},
    {name: "table value copy", body: `DATA(holders) = VALUE ty_holders( ( pointer = REF #( owner->items ) ) ).
      DATA(copy) = holders. SORT copy[ 1 ]-pointer->*.`},
    {name: "table rows copied by value", body: `holder-pointer = REF #( owner->items ).
      DATA(copy) = VALUE ty_holders( ( holder ) ). SORT copy[ 1 ]-pointer->*.`},
    {name: "by-value method parameter", body: "holder-pointer = REF #( owner->items ). sort_value( holder )."},
    {name: "by-reference method parameter", body: "holder-pointer = REF #( owner->items ). sort_reference( holder )."},
    {name: "constructor passed by value", body: "sort_value( VALUE #( pointer = REF #( owner->items ) ) )."},
    {name: "returned structure", body: "holder-pointer = REF #( owner->items ). DATA(copy) = identity( holder ). SORT copy-pointer->*."},
    {name: "by-value FORM parameter", body: "holder-pointer = REF #( owner->items ). PERFORM sort_form USING holder."},
    {name: "CORRESPONDING", body: `holder-pointer = REF #( owner->items ).
      DATA(copy) = CORRESPONDING ty_holder( holder ). SORT copy-pointer->*.`},
    {name: "CORRESPONDING mapping", body: `TYPES: BEGIN OF ty_renamed, other_pointer TYPE ty_pointer, END OF ty_renamed.
      DATA renamed TYPE ty_renamed. renamed-other_pointer = REF #( owner->items ).
      DATA(copy) = CORRESPONDING ty_holder( renamed MAPPING pointer = other_pointer ). SORT copy-pointer->*.`},
    {name: "CORRESPONDING base", body: `TYPES: BEGIN OF ty_number, number TYPE i, END OF ty_number.
      DATA numbers TYPE ty_number. holder-pointer = REF #( owner->items ).
      DATA(copy) = CORRESPONDING ty_holder( BASE ( holder ) numbers ). SORT copy-pointer->*.`},
    {name: "table LINES OF", body: `DATA(holders) = VALUE ty_holders( ( pointer = REF #( owner->items ) ) ).
      DATA(copy) = VALUE ty_holders( ( LINES OF holders ) ). SORT copy[ 1 ]-pointer->*.`},
    {name: "FILTER", body: `TYPES ty_sorted TYPE SORTED TABLE OF ty_holder WITH UNIQUE KEY number.
      DATA(holders) = VALUE ty_sorted( ( pointer = REF #( owner->items ) number = 1 ) ).
      DATA(copy) = FILTER #( holders WHERE number = 1 ). SORT copy[ 1 ]-pointer->*.`},
    {name: "conditional structure constructors", body: `DATA(copy) = COND ty_holder(
      WHEN condition = 1 THEN VALUE #( pointer = REF #( owner->items ) )
      ELSE VALUE #( pointer = REF #( owner->other_items ) ) ). SORT copy-pointer->*.`},
    {name: "LET reference binding", body: `DATA(pointer) = COND ty_pointer( LET selected = REF #( owner->items ) IN
      WHEN condition = 1 THEN selected ELSE selected ). SORT pointer->*.`},
  ];
  for (const test of protectedValues) {
    it(`preserves reference permissions through ${test.name}`, () => {
      const issues = run(test.body);
      expect(issues.map(i => i.getMessage())).to.have.length(1);
      expect(issues[0].getMessage()).to.include("read-only storage");
      expect(issues[0].getSeverity()).to.equal(Severity.Error);
    });
  }

  it("warns for a conditional reference with protected and writable alternatives", () => {
    const issues = run(`DATA(pointer) = COND ty_pointer( WHEN condition = 1 THEN REF #( owner->items )
      ELSE REF #( mutable ) ). SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("warns for conditional structure copies with protected and writable reference components", () => {
    const issues = run(`DATA(copy) = COND ty_holder( WHEN condition = 1 THEN VALUE #( pointer = REF #( owner->items ) )
      ELSE VALUE #( pointer = REF #( mutable ) ) ). SORT copy-pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("preserves writable CAST references", () => {
    expect(run("DATA(pointer) = CAST lcl_owner=>ty_items( REF #( mutable ) ). SORT pointer->*.")).to.have.length(0);
  });

  it("allows writes through writable CAST targets", () => {
    expect(run(`DATA(read_copy) = owner->items.
      DATA(pointer) = REF #( mutable ).
      SORT CAST lcl_owner=>ty_items( pointer )->*.
      CLEAR CAST lcl_owner=>ty_items( pointer )->*.
      CAST lcl_owner=>ty_items( pointer )->* = mutable.`)).to.have.length(0);
  });

  it("allows binding and reading a protected CAST expression", () => {
    expect(run(`DATA(pointer) = REF #( owner->items ).
      ASSIGN CAST lcl_owner=>ty_items( pointer )->* TO FIELD-SYMBOL(<items>).
      DATA(read_copy) = <items>.`)).to.have.length(0);
  });

  it("gives copied table values fresh write permissions", () => {
    expect(run("DATA(copy) = owner->items. SORT copy.")).to.have.length(0);
  });

  it("copies reference cells independently while retaining their pointee permissions", () => {
    const issues = run(`holder-pointer = REF #( owner->items ). DATA(copy) = holder.
      copy-pointer = REF #( mutable ). SORT copy-pointer->*. SORT holder-pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getMessage()).to.include("read-only storage");
  });

  it("omits reference components excluded by CORRESPONDING", () => {
    expect(run(`holder-pointer = REF #( owner->items ).
      DATA(copy) = CORRESPONDING ty_holder( holder EXCEPT pointer ). SORT copy-pointer->*.`)).to.have.length(0);
  });

  it("clears reference components together with their containing structure", () => {
    expect(run("holder-pointer = REF #( owner->items ). CLEAR holder. SORT holder-pointer->*.")).to.have.length(0);
  });

  it("keeps nested callee allocations independent at separate outer call sites", () => {
    const issues = run(`holder-pointer = REF #( owner->items ).
      DATA(first) = wrapper( holder ).
      holder-pointer = REF #( mutable ).
      DATA(second) = wrapper( holder ).
      SORT first->*-pointer->*.
      SORT second->*-pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("keeps writable reference-cell addresses writable", () => {
    expect(run(`DATA(read_copy) = owner->items.
      DATA(pointer) = REF #( mutable ). DATA(outer) = ref_address( pointer ). SORT outer->*->*.`)).to.have.length(0);
  });

  it("excludes a throwing conditional branch from normal continuation", () => {
    expect(run(`DATA(pointer) = REF #( owner->items ).
      number = COND i( WHEN condition = 1
        THEN redirect( EXPORTING writable = REF #( mutable ) CHANGING pointer = pointer )
        ELSE THROW lcl_error( ) ). SORT pointer->*.`)).to.have.length(0);
  });
});
