import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function program(external = "", own = "", friend = "", child = ""): string {
  return `
CLASS lcl_friend DEFINITION DEFERRED.
CLASS lcl_owner DEFINITION FRIENDS lcl_friend.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    TYPES: BEGIN OF ty_row,
             value TYPE i,
           END OF ty_row.
    TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
    DATA other_items TYPE ty_items READ-ONLY.
    DATA rows TYPE ty_rows READ-ONLY.
    DATA number TYPE i READ-ONLY.
    DATA pointer TYPE REF TO i READ-ONLY.
    METHODS run.
    METHODS get_items RETURNING VALUE(result) TYPE REF TO ty_items.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION.
  METHOD run.
    ${own}
  ENDMETHOD.
  METHOD get_items.
    GET REFERENCE OF items INTO result.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_friend DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl_friend IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    ${friend}
  ENDMETHOD.
ENDCLASS.
CLASS lcl_child DEFINITION INHERITING FROM lcl_owner.
  PUBLIC SECTION.
    METHODS update.
ENDCLASS.
CLASS lcl_child IMPLEMENTATION.
  METHOD update.
    ${child}
  ENDMETHOD.
ENDCLASS.
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    METHODS run IMPORTING condition TYPE i.
    CLASS-METHODS sort_items IMPORTING pointer TYPE REF TO lcl_owner=>ty_items.
    CLASS-METHODS identity IMPORTING pointer TYPE REF TO lcl_owner=>ty_items
      RETURNING VALUE(result) TYPE REF TO lcl_owner=>ty_items.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    DATA mutable_items TYPE lcl_owner=>ty_items.
    DATA mutable_row TYPE lcl_owner=>ty_row.
    DATA number TYPE i.
    DATA text TYPE string.
    ${external}
  ENDMETHOD.
  METHOD sort_items.
    SORT pointer->*.
  ENDMETHOD.
  METHOD identity.
    result = pointer.
  ENDMETHOD.
ENDCLASS.`;
}

function run(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zread_only_write.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write", () => {
  const tests = [
    {
      name: "reports the original issue's ASSIGN followed by SORT at the write",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    SORT <items>.`,
      count: 1,
    },
    {
      name: "allows binding and reading a readonly table",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    text = <items>[ 1 ].`,
      count: 0,
    },
    {
      name: "reports writes through a predeclared field symbol",
      body: `FIELD-SYMBOLS <items> TYPE lcl_owner=>ty_items.
    ASSIGN owner->items TO <items>.
    CLEAR <items>.`,
      count: 1,
    },
    {
      name: "reports writes through an alias of an alias",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    ASSIGN <items> TO FIELD-SYMBOL(<other>).
    SORT <other>.`,
      count: 1,
    },
    {
      name: "allows a successful rebinding to a writable table",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    ASSIGN mutable_items TO <items>.
    SORT <items>.`,
      count: 0,
    },
    {
      name: "keeps an alias's own binding when the original alias is rebound",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    ASSIGN <items> TO FIELD-SYMBOL(<other>).
    ASSIGN mutable_items TO <items>.
    SORT <other>.
    SORT <items>.`,
      count: 1,
    },
    {
      name: "allows modifying a value copy",
      body: `DATA(items) = owner->items.
    SORT items.`,
      count: 0,
    },
    {
      name: "does not retain readonly provenance after UNASSIGN and a new binding",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    UNASSIGN <items>.
    ASSIGN mutable_items TO <items>.
    SORT <items>.`,
      count: 0,
    },
    {
      name: "reports each mutation rather than the legal binding",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    APPEND text TO <items>.
    DELETE <items> INDEX 1.
    FREE <items>.`,
      count: 3,
    },
    {
      name: "reports scalar and structure-component aliases",
      body: `ASSIGN owner->number TO FIELD-SYMBOL(<number>).
    <number> = 1.
    ASSIGN owner->rows[ 1 ]-value TO FIELD-SYMBOL(<value>).
    CLEAR <value>.`,
      count: 2,
    },
    {
      name: "reports a loop row mutation",
      body: `LOOP AT owner->rows ASSIGNING FIELD-SYMBOL(<row>).
      <row>-value = 1.
    ENDLOOP.`,
      count: 1,
    },
    {
      name: "allows reads of loop rows",
      body: `LOOP AT owner->rows ASSIGNING FIELD-SYMBOL(<row>).
      number = <row>-value.
    ENDLOOP.`,
      count: 0,
    },
    {
      name: "retains a possible old binding when a loop may execute zero times",
      body: `ASSIGN owner->number TO FIELD-SYMBOL(<number>).
    LOOP AT mutable_items INTO text.
      ASSIGN number TO <number>.
    ENDLOOP.
    CLEAR <number>.`,
      count: 1,
      severity: Severity.Warning,
    },
    {
      name: "warns when a loop may leave a protected row bound",
      body: `FIELD-SYMBOLS <row> TYPE lcl_owner=>ty_row.
    ASSIGN mutable_row TO <row>.
    LOOP AT owner->rows ASSIGNING <row>.
      number = <row>-value.
    ENDLOOP.
    <row>-value = 1.`,
      count: 1,
      severity: Severity.Warning,
    },
    {
      name: "reports a protected row reference acquired by READ TABLE",
      body: `READ TABLE owner->rows REFERENCE INTO DATA(pointer) INDEX 1.
    pointer->value = 1.`,
      count: 1,
    },
    {
      name: "reports a protected row bound by READ TABLE ASSIGNING",
      body: `READ TABLE owner->rows ASSIGNING FIELD-SYMBOL(<row>) INDEX 1.
    <row>-value = 1.`,
      count: 1,
    },
    {
      name: "reports a protected row reference inside a loop",
      body: `LOOP AT owner->rows REFERENCE INTO DATA(pointer).
      pointer->value = 1.
    ENDLOOP.`,
      count: 1,
    },
    {
      name: "keeps protection through GET REFERENCE of a protected field symbol",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    GET REFERENCE OF <items> INTO DATA(pointer).
    SORT pointer->*.`,
      count: 1,
    },
    {
      name: "keeps protection through REF of a protected field symbol",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    SORT pointer->*.`,
      count: 1,
    },
    {
      name: "keeps a copied data reference's own target after rebinding",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    DATA(other) = pointer.
    pointer = REF #( mutable_items ).
    SORT other->*.
    SORT pointer->*.`,
      count: 1,
    },
    {
      name: "allows a writable reference deliberately returned by the owner",
      body: `DATA(pointer) = owner->get_items( ).
    SORT pointer->*.`,
      count: 0,
    },
    {
      name: "allows dereferencing an alias of a readonly reference cell",
      body: `ASSIGN owner->pointer TO FIELD-SYMBOL(<pointer>).
    <pointer>->* = 1.`,
      count: 0,
    },
    {
      name: "reports replacing a readonly reference cell through an alias",
      body: `ASSIGN owner->pointer TO FIELD-SYMBOL(<pointer>).
    <pointer> = REF #( number ).`,
      count: 1,
    },
    {
      name: "reports when both branches bind protected storage",
      body: `FIELD-SYMBOLS <items> TYPE lcl_owner=>ty_items.
    IF condition = 1.
      ASSIGN owner->items TO <items>.
    ELSE.
      ASSIGN owner->other_items TO <items>.
    ENDIF.
    SORT <items>.`,
      count: 1,
    },
    {
      name: "warns when only one branch binds protected storage",
      body: `FIELD-SYMBOLS <items> TYPE lcl_owner=>ty_items.
    IF condition = 1.
      ASSIGN owner->items TO <items>.
    ELSE.
      ASSIGN mutable_items TO <items>.
    ENDIF.
    SORT <items>.`,
      count: 1,
      severity: Severity.Warning,
    },
    {
      name: "keeps the incoming state on a branch without an ELSE",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    IF condition = 1.
      ASSIGN mutable_items TO <items>.
    ENDIF.
    SORT <items>.`,
      count: 1,
      severity: Severity.Warning,
    },
    {
      name: "keeps possible protection when conditional ASSIGN can fail",
      body: `DATA component TYPE string.
    ASSIGN owner->number TO FIELD-SYMBOL(<number>).
    ASSIGN COMPONENT component OF STRUCTURE mutable_row TO <number>.
    CLEAR <number>.`,
      count: 1,
      severity: Severity.Warning,
    },
    {
      name: "clears previous protection on conditional ASSIGN ELSE UNASSIGN",
      body: `DATA component TYPE string.
    ASSIGN owner->number TO FIELD-SYMBOL(<number>).
    ASSIGN COMPONENT component OF STRUCTURE mutable_row TO <number> ELSE UNASSIGN.
    CLEAR <number>.`,
      count: 0,
    },
    {
      name: "tracks a protected reference through a resolved identity method",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    DATA(other) = identity( pointer ).
    SORT other->*.`,
      count: 1,
    },
    {
      name: "reports a resolved method's mutation through a protected actual reference",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    sort_items( pointer ).`,
      count: 1,
    },
    {
      name: "allows the same resolved mutator with a writable reference",
      body: `DATA(pointer) = REF #( mutable_items ).
    sort_items( pointer ).`,
      count: 0,
    },
    {
      name: "does not invent a definite failure for an unknown reference",
      body: `DATA pointer TYPE REF TO lcl_owner=>ty_items.
    SORT pointer->*.`,
      count: 0,
    },
    {
      name: "observes updates to a reference cell through its field-symbol alias",
      body: `DATA(pointer) = REF #( mutable_items ).
    ASSIGN pointer TO FIELD-SYMBOL(<pointer>).
    ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    pointer = REF #( <items> ).
    SORT <pointer>->*.`,
      count: 1,
    },
    {
      name: "observes a writable replacement of a reference cell",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    ASSIGN pointer TO FIELD-SYMBOL(<pointer>).
    pointer = REF #( mutable_items ).
    SORT <pointer>->*.`,
      count: 0,
    },
    {
      name: "updates a reference cell when assigned through its field-symbol alias",
      body: `DATA(pointer) = REF #( mutable_items ).
    ASSIGN pointer TO FIELD-SYMBOL(<pointer>).
    ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    <pointer> = REF #( <items> ).
    SORT pointer->*.`,
      count: 1,
    },
    {
      name: "does not retarget an existing dereference binding when the reference changes",
      body: `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    ASSIGN pointer->* TO FIELD-SYMBOL(<bound>).
    pointer = REF #( mutable_items ).
    SORT <bound>.`,
      count: 1,
    },
    {
      name: "allows modifying an elementary value copied through a protected alias",
      body: `ASSIGN owner->number TO FIELD-SYMBOL(<number>).
    number = <number>.
    CLEAR number.`,
      count: 0,
    },
    {
      name: "allows modifying a table value constructor that copies readonly content",
      body: `DATA(items) = VALUE lcl_owner=>ty_items( BASE owner->items ( text ) ).
    SORT items.`,
      count: 0,
    },
    {
      name: "does not interpret attribute names in literals as aliases",
      body: `DATA(value) = 'owner->items READ-ONLY'.
    CLEAR value.`,
      count: 0,
    },
  ];

  for (const test of tests) {
    it(test.name, () => {
      const issues = run(program(test.body));
      expect(issues.map(i => i.getMessage())).to.have.length(test.count);
      for (const issue of issues) {
        expect(issue.getSeverity()).to.equal(test.severity ?? Severity.Error);
        expect(issue.getKey()).to.equal("read_only_write");
        expect(issue.getDefaultFix()).to.equal(undefined);
        if (test.severity === Severity.Warning) {
          expect(issue.getMessage()).to.match(/may/i);
        }
      }
    });
  }

  it("locates the original issue at SORT rather than ASSIGN", () => {
    const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    SORT <items>.`);
    const issues = run(abap);
    expect(issues).to.have.length(1);
    expect(abap.split("\n")[issues[0].getStart().getRow() - 1].trim()).to.equal("SORT <items>.");
  });

  it("allows bindings made inside the owning class", () => {
    expect(run(program("", `ASSIGN items TO FIELD-SYMBOL(<items>).
    SORT <items>.`))).to.deep.equal([]);
  });

  it("allows bindings made inside a friend class", () => {
    expect(run(program("", "", `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    SORT <items>.`))).to.deep.equal([]);
  });

  it("allows bindings made inside a subclass", () => {
    expect(run(program("", "", "", `ASSIGN items TO FIELD-SYMBOL(<items>).
    SORT <items>.`))).to.deep.equal([]);
  });

  it("reports a FORM mutation through a protected actual parameter passed by reference", () => {
    const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    PERFORM sort_items CHANGING <items>.`) + `
FORM sort_items CHANGING items TYPE lcl_owner=>ty_items.
  SORT items.
ENDFORM.`;
    expect(run(abap)).to.have.length(1);
  });

  it("allows a FORM mutation of a writable actual parameter", () => {
    const abap = program("PERFORM sort_items CHANGING mutable_items.") + `
FORM sort_items CHANGING items TYPE lcl_owner=>ty_items.
  SORT items.
ENDFORM.`;
    expect(run(abap)).to.deep.equal([]);
  });

  it("allows a FORM mutation of its independent value parameter", () => {
    const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    PERFORM sort_items USING <items>.`) + `
FORM sort_items USING VALUE(items) TYPE lcl_owner=>ty_items.
  SORT items.
ENDFORM.`;
    expect(run(abap)).to.deep.equal([]);
  });

  it("tracks a reference copied through FORM output parameters", () => {
    const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    DATA other TYPE REF TO lcl_owner=>ty_items.
    PERFORM identity USING pointer CHANGING other.
    SORT other->*.`) + `
FORM identity USING input TYPE REF TO lcl_owner=>ty_items CHANGING output TYPE REF TO lcl_owner=>ty_items.
  output = input.
ENDFORM.`;
    expect(run(abap)).to.have.length(1);
  });
});

function interfaceProgram(own = "", external = ""): string {
  return `
INTERFACE lif_items.
  TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
  DATA items TYPE ty_items READ-ONLY.
ENDINTERFACE.
CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_items.
    METHODS run.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION.
  METHOD run.
    DATA view TYPE REF TO lif_items.
    view = me.
    ${own}
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  DATA owner TYPE REF TO lcl_owner.
  DATA view TYPE REF TO lif_items.
  view = owner.
  ${external}`;
}

describe("Rule: read_only_write, interface views", () => {
  it("reports an external mutation through an interface-view binding", () => {
    const issues = run(interfaceProgram("", `ASSIGN view->items TO FIELD-SYMBOL(<items>).
  SORT <items>.`));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("reports an external mutation through a qualified implementing-class binding", () => {
    expect(run(interfaceProgram("", `ASSIGN owner->lif_items~items TO FIELD-SYMBOL(<items>).
  SORT <items>.`))).to.have.length(1);
  });

  it("retains interface-view protection inside the implementing class", () => {
    expect(run(interfaceProgram(`ASSIGN view->items TO FIELD-SYMBOL(<items>).
    SORT <items>.`))).to.have.length(1);
  });

  it("allows bindings through self inside the implementing class", () => {
    expect(run(interfaceProgram(`ASSIGN me->lif_items~items TO FIELD-SYMBOL(<items>).
    SORT <items>.`))).to.deep.equal([]);
  });
});

describe("Rule: read_only_write, calls in expressions", () => {
  const prefix = `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).`;
  const expressions = [
    {name: "IF condition", body: "IF mutate( pointer ) = 1. number = 1. ENDIF."},
    {name: "WHILE condition", body: "WHILE mutate( pointer ) = 1. number = 1. ENDWHILE."},
    {name: "CASE selector", body: "CASE mutate( pointer ). WHEN 1. number = 1. ENDCASE."},
  ];
  for (const test of expressions) {
    it(`reports a local mutator called in an ${test.name}`, () => {
      const abap = program(prefix + test.body)
        .replace("CLASS-METHODS identity", `CLASS-METHODS mutate IMPORTING pointer TYPE REF TO lcl_owner=>ty_items
      RETURNING VALUE(result) TYPE i.
    CLASS-METHODS identity`)
        .replace("  METHOD identity.", `  METHOD mutate.
    SORT pointer->*.
    result = 1.
  ENDMETHOD.
  METHOD identity.`);
      expect(run(abap)).to.have.length(1);
    });
  }

  it("allows an opaque method to consume an independent value copy", () => {
    const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA external TYPE REF TO lcl_external.
    external->consume( <items> ).`)
      .replace("CLASS lcl_user DEFINITION.", `CLASS lcl_external DEFINITION ABSTRACT.
  PUBLIC SECTION.
    METHODS consume ABSTRACT IMPORTING VALUE(items) TYPE lcl_owner=>ty_items.
ENDCLASS.
CLASS lcl_external IMPLEMENTATION.
ENDCLASS.
CLASS lcl_user DEFINITION.`);
    expect(run(abap)).to.deep.equal([]);
  });
});

describe("Rule: read_only_write, control flow", () => {
  for (const transfer of ["EXIT", "CONTINUE"]) {
    it(`retains bindings from before ${transfer}`, () => {
      const issues = run(program(`ASSIGN mutable_items TO FIELD-SYMBOL(<items>).
    WHILE condition = 1.
      ASSIGN owner->items TO <items>.
      ${transfer}.
      ASSIGN mutable_items TO <items>.
    ENDWHILE.
    SORT <items>.`));
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Warning);
    });

    it(`does not report an unreachable write after ${transfer}`, () => {
      expect(run(program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    WHILE condition = 1.
      ${transfer}.
      SORT <items>.
    ENDWHILE.`))).to.deep.equal([]);
    });
  }

  it("reports a protected alias mutation in a catch handler", () => {
    const issues = run(program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    TRY.
      text = owner->items[ 1 ].
    CATCH cx_sy_itab_line_not_found.
      SORT <items>.
    ENDTRY.`));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  for (const body of ["", '" only a comment']) {
    it(`ignores unreachable catch writes for a ${body ? "comment-only" : "empty"} TRY body`, () => {
      expect(run(program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    TRY.
      ${body}
    CATCH cx_root.
      SORT <items>.
    ENDTRY.`))).to.deep.equal([]);
    });
  }

  const declarations = [
    "DATA local_number TYPE i VALUE 1.",
    "STATICS local_number TYPE i VALUE 1.",
    "CONSTANTS local_number TYPE i VALUE 1.",
    "TYPES ty_local TYPE i.",
    "FIELD-SYMBOLS <local> TYPE i.",
    "DATA: BEGIN OF local_structure, pointer TYPE REF TO i, END OF local_structure.",
  ];
  for (const declaration of declarations) {
    it(`ignores unreachable catch writes after ${declaration}`, () => {
      expect(run(program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    TRY.
      ${declaration}
    CATCH cx_root.
      SORT <items>.
    ENDTRY.`))).to.deep.equal([]);
    });
  }

  it("preserves alias bindings when a catch after an empty TRY cannot run", () => {
    const issues = run(program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    TRY.
    CATCH cx_root.
      ASSIGN mutable_items TO <items>.
    ENDTRY.
    SORT <items>.`));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("joins protected catch bindings with writable normal completion", () => {
    const issues = run(program(`ASSIGN mutable_items TO FIELD-SYMBOL(<items>).
    TRY.
      text = owner->items[ 1 ].
    CATCH cx_sy_itab_line_not_found.
      ASSIGN owner->items TO <items>.
    ENDTRY.
    SORT <items>.`));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });
});

describe("Rule: read_only_write, recursive object paths", () => {
  const paths = [
    {name: "a recursive next pointer", attributes: "DATA next TYPE REF TO lcl_node.", body: "node = node->next."},
    {
      name: "four alternative recursive pointers",
      attributes: `DATA n0 TYPE REF TO lcl_node.
    DATA n1 TYPE REF TO lcl_node.
    DATA n2 TYPE REF TO lcl_node.
    DATA n3 TYPE REF TO lcl_node.`,
      body: `CASE condition.
      WHEN 1. node = node->n0.
      WHEN 2. node = node->n1.
      WHEN 3. node = node->n2.
      WHEN OTHERS. node = node->n3.
    ENDCASE.`,
    },
  ];
  for (const test of paths) {
    it(`finishes analysis of a loop following ${test.name}`, function() {
      this.timeout(1000);
      const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA node TYPE REF TO lcl_node.
    CREATE OBJECT node.
    WHILE condition = 1.
      ${test.body}
    ENDWHILE.`)
        .replace("CLASS lcl_user DEFINITION.", `CLASS lcl_node DEFINITION.
  PUBLIC SECTION.
    ${test.attributes}
ENDCLASS.
CLASS lcl_node IMPLEMENTATION.
ENDCLASS.
CLASS lcl_user DEFINITION.`);
      expect(run(abap)).to.deep.equal([]);
    });
  }
});

describe("Rule: read_only_write, statement rebinding", () => {
  const tests = [
    {
      name: "APPEND ASSIGNING replaces a field symbol's old binding",
      body: `DATA mutable_rows TYPE lcl_owner=>ty_rows.
    ASSIGN owner->rows[ 1 ] TO FIELD-SYMBOL(<row>).
    APPEND INITIAL LINE TO mutable_rows ASSIGNING <row>.
    CLEAR <row>.`,
    },
    {
      name: "APPEND REFERENCE INTO replaces a reference's old target",
      body: `DATA mutable_rows TYPE lcl_owner=>ty_rows.
    GET REFERENCE OF owner->rows[ 1 ] INTO DATA(pointer).
    APPEND INITIAL LINE TO mutable_rows REFERENCE INTO pointer.
    pointer->value = 1.`,
    },
    {
      name: "INSERT ASSIGNING replaces a field symbol's old binding",
      body: `DATA mutable_rows TYPE lcl_owner=>ty_rows.
    ASSIGN owner->rows[ 1 ] TO FIELD-SYMBOL(<row>).
    INSERT INITIAL LINE INTO mutable_rows INDEX 1 ASSIGNING <row>.
    CLEAR <row>.`,
    },
    {
      name: "INSERT REFERENCE INTO replaces a reference's old target",
      body: `DATA mutable_rows TYPE lcl_owner=>ty_rows.
    GET REFERENCE OF owner->rows[ 1 ] INTO DATA(pointer).
    INSERT INITIAL LINE INTO TABLE mutable_rows REFERENCE INTO pointer.
    pointer->value = 1.`,
    },
  ];
  for (const test of tests) {
    it(test.name, () => {
      expect(run(program(test.body))).to.deep.equal([]);
    });
  }

  for (const index of [1, 2]) {
    it(`handles reference rebinding after INSERT INDEX ${index}`, () => {
      const issues = run(program(`DATA mutable_rows TYPE lcl_owner=>ty_rows.
    READ TABLE owner->rows REFERENCE INTO DATA(pointer) INDEX 1.
    INSERT INITIAL LINE INTO mutable_rows INDEX ${index} REFERENCE INTO pointer.
    pointer->value = 1.`));
      expect(issues).to.have.length(index === 1 ? 0 : 1);
      if (index === 2) {
        expect(issues[0].getSeverity()).to.equal(Severity.Warning);
      }
    });
  }

  it("preserves referenced storage when a table value is copied and read INTO", () => {
    const issues = run(program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    TYPES ty_refs TYPE STANDARD TABLE OF REF TO lcl_owner=>ty_items WITH DEFAULT KEY.
    DATA refs TYPE ty_refs.
    APPEND pointer TO refs.
    DATA(other_refs) = refs.
    READ TABLE other_refs INDEX 1 INTO DATA(other_pointer).
    SORT other_pointer->*.`));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });
});

describe("Rule: read_only_write, resolved call effects", () => {
  const prefix = `ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).`;

  for (const call of [
    "CALL METHOD sort_items EXPORTING pointer = pointer.",
    "CALL METHOD lcl_user=>sort_items EXPORTING pointer = pointer.",
  ]) {
    it(`reports ${call}`, () => {
      expect(run(program(prefix + call))).to.have.length(1);
    });
  }

  it("preserves a reference returned through classic CALL METHOD RECEIVING", () => {
    expect(run(program(prefix + `DATA other TYPE REF TO lcl_owner=>ty_items.
    CALL METHOD identity EXPORTING pointer = pointer RECEIVING result = other.
    SORT other->*.`))).to.have.length(1);
  });

  for (const chained of [false, true]) {
    it(`reports an instance mutation called ${chained ? "through a factory chain" : "on an ordinary receiver"}`, () => {
      const body = chained ? "factory( )->consume( pointer )." : `DATA worker TYPE REF TO lcl_user.
    CREATE OBJECT worker.
    worker->consume( pointer ).`;
      const abap = program(prefix + body)
        .replace("CLASS-METHODS identity", `CLASS-METHODS factory RETURNING VALUE(result) TYPE REF TO lcl_user.
    METHODS consume IMPORTING pointer TYPE REF TO lcl_owner=>ty_items.
    CLASS-METHODS identity`)
        .replace("  METHOD identity.", `  METHOD factory.
    CREATE OBJECT result.
  ENDMETHOD.
  METHOD consume.
    SORT pointer->*.
  ENDMETHOD.
  METHOD identity.`);
      expect(run(abap)).to.have.length(1);
    });
  }

  for (const copy of [false, true]) {
    it(`propagates a static reference published by a method${copy ? " through a local copy" : ""}`, () => {
      const write = copy ? "DATA(local) = lcl_user=>published. SORT local->*." : "SORT lcl_user=>published->*.";
      const abap = program(prefix + "publish( pointer )." + write)
        .replace("CLASS-METHODS identity", `CLASS-DATA published TYPE REF TO lcl_owner=>ty_items.
    CLASS-METHODS publish IMPORTING pointer TYPE REF TO lcl_owner=>ty_items.
    CLASS-METHODS identity`)
        .replace("  METHOD identity.", `  METHOD publish.
    published = pointer.
  ENDMETHOD.
  METHOD identity.`);
      expect(run(abap)).to.have.length(1);
    });
  }

  it("propagates a static reference published by a FORM", () => {
    const abap = program("PERFORM publish. SORT lcl_user=>published->*.")
      .replace("CLASS-METHODS identity", `CLASS-DATA published TYPE REF TO lcl_owner=>ty_items.
    CLASS-METHODS identity`) + `
FORM publish.
  DATA owner TYPE REF TO lcl_owner.
  lcl_user=>published = REF #( owner->items ).
ENDFORM.`;
    expect(run(abap)).to.have.length(1);
  });

  it("joins conditional call side effects instead of applying both branches in order", () => {
    const abap = program(prefix + `number = COND #( WHEN condition = 1 THEN publish( pointer )
      ELSE publish( REF #( mutable_items ) ) ).
    SORT saved->*.`)
      .replace("CLASS-METHODS identity", `CLASS-DATA saved TYPE REF TO lcl_owner=>ty_items.
    CLASS-METHODS publish IMPORTING pointer TYPE REF TO lcl_owner=>ty_items RETURNING VALUE(result) TYPE i.
    CLASS-METHODS identity`)
      .replace("  METHOD identity.", `  METHOD publish.
    saved = pointer.
    result = 1.
  ENDMETHOD.
  METHOD identity.`);
    const issues = run(abap);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });
});

describe("Rule: read_only_write, receiver state", () => {
  const boxClass = `CLASS lcl_box DEFINITION FINAL.
  PUBLIC SECTION.
    DATA cache TYPE REF TO lcl_owner=>ty_items.
    METHODS publish IMPORTING pointer TYPE REF TO lcl_owner=>ty_items.
    METHODS fetch RETURNING VALUE(result) TYPE REF TO lcl_owner=>ty_items.
    METHODS mutate.
ENDCLASS.
CLASS lcl_box IMPLEMENTATION.
  METHOD publish. cache = pointer. ENDMETHOD.
  METHOD fetch. result = cache. ENDMETHOD.
  METHOD mutate. SORT cache->*. ENDMETHOD.
ENDCLASS.
`;
  const tests = [
    {name: "reads a reference assigned by another method", body: "box->publish( pointer ). SORT box->cache->*."},
    {name: "mutates a reference stored by the caller", body: "box->cache = pointer. box->mutate( )."},
    {
      name: "returns a reference stored by the caller",
      body: `box->cache = pointer.
    DATA(other) = box->fetch( ).
    SORT other->*.`,
    },
  ];
  for (const test of tests) {
    it(test.name, () => {
      const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    DATA box TYPE REF TO lcl_box.
    CREATE OBJECT box.
    ${test.body}`).replace("CLASS lcl_user DEFINITION.", boxClass + "CLASS lcl_user DEFINITION.");
      expect(run(abap)).to.have.length(1);
    });
  }

  for (const protectedReceiver of [true, false]) {
    it(`keeps separate receiver instances' ${protectedReceiver ? "protected" : "writable"} references`, () => {
      const abap = program(`ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    DATA(pointer) = REF #( <items> ).
    DATA first TYPE REF TO lcl_box.
    DATA second TYPE REF TO lcl_box.
    CREATE OBJECT first.
    CREATE OBJECT second.
    first->publish( pointer ).
    second->publish( REF #( mutable_items ) ).
    SORT ${protectedReceiver ? "first" : "second"}->cache->*.`)
        .replace("CLASS lcl_user DEFINITION.", boxClass + "CLASS lcl_user DEFINITION.");
      expect(run(abap)).to.have.length(protectedReceiver ? 1 : 0);
    });
  }
});

describe("Rule: read_only_write, additional control flow", () => {
  for (const transfer of ["RETURN", "EXIT"]) {
    it(`starts the next event after ${transfer} terminates an earlier event`, () => {
      expect(run(program() + `
INITIALIZATION.
  ${transfer}.
START-OF-SELECTION.
  DATA owner TYPE REF TO lcl_owner.
  ASSIGN owner->items TO FIELD-SYMBOL(<items>).
  SORT <items>.`)).to.have.length(1);
    });
  }

  it("does not apply CLEANUP bindings to normal completion", () => {
    expect(run(program(`ASSIGN mutable_items TO FIELD-SYMBOL(<items>).
    TRY.
      text = owner->items[ 1 ].
    CLEANUP.
      ASSIGN owner->items TO <items>.
    ENDTRY.
    SORT <items>.`))).to.deep.equal([]);
  });

  it("joins CASE TYPE OF branches", () => {
    const issues = run(program(`FIELD-SYMBOLS <items> TYPE lcl_owner=>ty_items.
    DATA object TYPE REF TO object.
    CASE TYPE OF object.
      WHEN TYPE lcl_owner. ASSIGN owner->items TO <items>.
      WHEN OTHERS. ASSIGN mutable_items TO <items>.
    ENDCASE.
    SORT <items>.`));
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });
});

describe("Rule: read_only_write, table expression aliases", () => {
  const tests = [
    {name: "standalone method call", body: "<owners>[ 1 ]->run( ).", count: 1},
    {name: "object component write", body: "<owners>[ 1 ]->mutable = 1.", count: 1},
    {name: "object component read", body: "number = <owners>[ 1 ]->mutable.", count: 0},
  ];
  for (const test of tests) {
    it(`checks a ${test.name} through a protected table alias`, () => {
      const abap = program(`ASSIGN owner->owners TO FIELD-SYMBOL(<owners>).
    ${test.body}`)
        .replace("    DATA number", `    DATA owners TYPE STANDARD TABLE OF REF TO lcl_owner WITH DEFAULT KEY READ-ONLY.
    DATA mutable TYPE i.
    DATA number`);
      expect(run(abap)).to.have.length(test.count);
    });
  }
});
