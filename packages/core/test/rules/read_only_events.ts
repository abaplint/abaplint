import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ABAPObject} from "../../src/objects/_abap_object";
import {SyntaxLogic} from "../../src/abap/5_syntax/syntax";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import {ReadOnlyWrite} from "../../src/rules";
import {Severity} from "../../src/severity";

function run(body: string) {
  const abap = `REPORT zread_only_events NO STANDARD PAGE HEADING LINE-COUNT 6(2).
CLASS lcl_owner DEFINITION.
  PUBLIC SECTION.
    TYPES ty_items TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    DATA items TYPE ty_items READ-ONLY.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION. ENDCLASS.
DATA owner TYPE REF TO lcl_owner.
DATA mutable_items TYPE lcl_owner=>ty_items.
DATA pointer TYPE REF TO lcl_owner=>ty_items.
FIELD-SYMBOLS <items> TYPE lcl_owner=>ty_items.
${body}
FORM protection_marker.
  DATA marker TYPE REF TO lcl_owner=>ty_items.
  GET REFERENCE OF owner->items INTO marker.
ENDFORM.`;
  const reg = new Registry().addFile(new MemoryFile("zread_only_events.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  expect(new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage()), "syntax issues").to.deep.equal([]);
  return new ReadOnlyWrite().initialize(reg).run(obj);
}

describe("Rule: read_only_write, reporting events", () => {
  it("preserves right-hand-side effects before an implicit assignment conversion fails", () => {
    const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS protect RETURNING VALUE(result) TYPE string.
    CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD protect.
    result = \`bad\`.
    pointer = REF #( owner->items ).
  ENDMETHOD.
  METHOD fail.
    DATA number TYPE i.
    number = protect( ).
    pointer = REF #( mutable_items ).
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("keeps a callee's intermediate protection when arithmetic fails before a later reset", () => {
    const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION. CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    pointer = REF #( owner->items ).
    DATA(number) = 1 / 0.
    pointer = REF #( mutable_items ).
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("retains implicit failures beside a different explicit exceptional path", () => {
    const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION. CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    TRY.
      IF sy-subrc = 0.
        pointer = REF #( owner->items ).
        DATA value TYPE i.
        DATA divisor TYPE i.
        value = 1 / divisor.
        pointer = REF #( mutable_items ).
      ELSE.
        pointer = REF #( mutable_items ).
        RAISE EXCEPTION TYPE cx_sy_zerodivide.
      ENDIF.
    CLEANUP.
      DATA ignored TYPE i.
    ENDTRY.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("applies CLEANUP after an implicit arithmetic failure", () => {
    const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION. CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    TRY.
      DATA value TYPE i.
      DATA divisor TYPE i.
      value = 1 / divisor.
    CLEANUP.
      pointer = REF #( owner->items ).
    ENDTRY.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("applies CLEANUP after an implicit table-expression failure", () => {
    const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION. CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    TRY.
      DATA(text) = owner->items[ 99 ].
    CLEANUP.
      pointer = REF #( owner->items ).
    ENDTRY.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  for (const protectedAfterCleanup of [false, true]) {
    it(`publishes CLEANUP's exceptional state (protected=${protectedAfterCleanup})`, () => {
      const issues = run(`CLASS cx_root DEFINITION. ENDCLASS.
CLASS cx_root IMPLEMENTATION. ENDCLASS.
CLASS cx_no_check DEFINITION INHERITING FROM cx_root. ENDCLASS.
CLASS cx_no_check IMPLEMENTATION. ENDCLASS.
CLASS lcl_error DEFINITION INHERITING FROM cx_no_check. ENDCLASS.
CLASS lcl_error IMPLEMENTATION. ENDCLASS.
CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION. CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    pointer = REF #( ${protectedAfterCleanup ? "mutable_items" : "owner->items"} ).
    TRY.
      RAISE EXCEPTION TYPE lcl_error.
    CLEANUP.
      pointer = REF #( ${protectedAfterCleanup ? "owner->items" : "mutable_items"} ).
    ENDTRY.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
      expect(issues).to.have.length(protectedAfterCleanup ? 1 : 0);
      if (protectedAfterCleanup) {
        expect(issues[0].getSeverity()).to.equal(Severity.Warning);
      }
    });
  }

  for (const matched of [false, true]) {
    it(`propagates an exception beyond an unmatched local catch (matched=${matched})`, () => {
      const issues = run(`CLASS cx_root DEFINITION. ENDCLASS.
CLASS cx_root IMPLEMENTATION. ENDCLASS.
CLASS cx_no_check DEFINITION INHERITING FROM cx_root. ENDCLASS.
CLASS cx_no_check IMPLEMENTATION. ENDCLASS.
CLASS lcl_error DEFINITION INHERITING FROM cx_no_check. ENDCLASS.
CLASS lcl_error IMPLEMENTATION. ENDCLASS.
CLASS lcl_other_error DEFINITION INHERITING FROM cx_no_check. ENDCLASS.
CLASS lcl_other_error IMPLEMENTATION. ENDCLASS.
CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION. CLASS-METHODS fail.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    pointer = REF #( owner->items ).
    TRY.
      RAISE EXCEPTION TYPE lcl_error.
    CATCH ${matched ? "lcl_error" : "lcl_other_error"}.
      pointer = REF #( mutable_items ).
    ENDTRY.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  TRY.
    lcl_user=>fail( ).
  CATCH cx_root.
    SORT pointer->*.
  ENDTRY.`);
      expect(issues).to.have.length(matched ? 0 : 1);
      if (!matched) {
        expect(issues[0].getSeverity()).to.equal(Severity.Warning);
      }
    });
  }

  it("evaluates a functional LOOP source once before the body changes shared aliases", () => {
    expect(run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    TYPES ty_numbers TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    CLASS-METHODS get RETURNING VALUE(result) TYPE ty_numbers.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD get. SORT <items>. result = VALUE #( ( 1 ) ). ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  ASSIGN mutable_items TO <items>.
  LOOP AT lcl_user=>get( ) INTO DATA(number).
    ASSIGN owner->items TO <items>.
  ENDLOOP.`)).to.deep.equal([]);
  });

  for (const loop of ["WHILE lcl_user=>get( ) = 1. ENDWHILE.", "DO lcl_user=>get( ) TIMES. ENDDO."]) {
    it(`skips continuation after a terminating ${loop}`, () => {
      expect(run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS get RETURNING VALUE(result) TYPE i.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD get. LEAVE PROGRAM. ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  ASSIGN owner->items TO <items>.
  ${loop}
  SORT <items>.`)).to.deep.equal([]);
    });
  }

  it("skips LOOP INTO writes after a terminating table expression", () => {
    expect(run(`CLASS lcl_box DEFINITION FINAL.
  PUBLIC SECTION.
    DATA number TYPE i READ-ONLY.
    TYPES ty_numbers TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    CLASS-METHODS get RETURNING VALUE(result) TYPE ty_numbers.
ENDCLASS.
CLASS lcl_box IMPLEMENTATION.
  METHOD get. LEAVE PROGRAM. ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  DATA(box) = NEW lcl_box( ).
  ASSIGN box->number TO FIELD-SYMBOL(<number>).
  LOOP AT lcl_box=>get( ) INTO <number>.
  ENDLOOP.`)).to.deep.equal([]);
  });

  it("preserves protected effects through branching raisers without creating a normal return", () => {
    const issues = run(`CLASS cx_root DEFINITION. ENDCLASS.
CLASS cx_root IMPLEMENTATION. ENDCLASS.
CLASS cx_no_check DEFINITION INHERITING FROM cx_root. ENDCLASS.
CLASS cx_no_check IMPLEMENTATION. ENDCLASS.
CLASS lcl_error DEFINITION INHERITING FROM cx_no_check. ENDCLASS.
CLASS lcl_error IMPLEMENTATION. ENDCLASS.
CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS fail.
    CLASS-METHODS wrapper.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail.
    IF sy-subrc = 0.
      pointer = REF #( owner->items ).
      ASSIGN pointer->* TO <items>.
      RAISE EXCEPTION TYPE lcl_error.
    ELSE.
      pointer = REF #( owner->items ).
      ASSIGN pointer->* TO <items>.
      RAISE EXCEPTION TYPE lcl_error.
    ENDIF.
  ENDMETHOD.
  METHOD wrapper.
    IF sy-subrc = 0.
      fail( ).
    ELSE.
      fail( ).
    ENDIF.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  ASSIGN mutable_items TO <items>.
  TRY.
    lcl_user=>wrapper( ).
  CATCH cx_root.
  ENDTRY.
  SORT pointer->*.
  SORT <items>.
  lcl_user=>fail( ).
  SORT pointer->*.`);
    expect(issues.map(i => i.getSeverity())).to.deep.equal([Severity.Warning, Severity.Warning]);
  });

  it("skips CASE TYPE INTO writes after a terminating selector", () => {
    for (const terminate of [true, false]) {
      const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS get RETURNING VALUE(result) TYPE REF TO object.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD get. ${terminate ? "LEAVE PROGRAM." : "result = NEW lcl_user( )."} ENDMETHOD.
ENDCLASS.
CLASS lcl_box DEFINITION FINAL.
  PUBLIC SECTION.
    DATA object TYPE REF TO lcl_user READ-ONLY.
    METHODS constructor.
ENDCLASS.
CLASS lcl_box IMPLEMENTATION.
  METHOD constructor. object = NEW lcl_user( ). ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  DATA(box) = NEW lcl_box( ).
  ASSIGN box->object TO FIELD-SYMBOL(<object>).
  CASE TYPE OF lcl_user=>get( ).
    WHEN TYPE lcl_user INTO <object>.
  ENDCASE.`);
      expect(issues).to.have.length(terminate ? 0 : 1);
    }
  });

  for (const writable of [false, true]) {
    it(`evaluates chained method arguments after the receiver (writable=${writable})`, () => {
      const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS get RETURNING VALUE(result) TYPE REF TO lcl_user.
    CLASS-METHODS prepare RETURNING VALUE(result) TYPE i.
    METHODS touch IMPORTING ignored TYPE i.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD get.
    pointer = REF #( ${writable ? "owner->items" : "mutable_items"} ).
    result = NEW lcl_user( ).
  ENDMETHOD.
  METHOD prepare.
    pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).
    result = 1.
  ENDMETHOD.
  METHOD touch.
    SORT pointer->*.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  lcl_user=>get( )->touch( lcl_user=>prepare( ) ).`);
      expect(issues).to.have.length(writable ? 0 : 1);
      if (!writable) {
        expect(issues[0].getSeverity()).to.equal(Severity.Error);
      }
    });
  }

  for (const receiver of ["lcl_user=>get( )", "NEW lcl_user( )"]) {
    it(`skips chained arguments and methods after ${receiver} leaves the program`, () => {
      expect(run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    METHODS constructor.
    CLASS-METHODS get RETURNING VALUE(result) TYPE REF TO lcl_user.
    CLASS-METHODS mutate RETURNING VALUE(result) TYPE i.
    METHODS touch IMPORTING ignored TYPE i.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD constructor. LEAVE PROGRAM. ENDMETHOD.
  METHOD get. LEAVE PROGRAM. ENDMETHOD.
  METHOD mutate. SORT pointer->*. result = 1. ENDMETHOD.
  METHOD touch. SORT pointer->*. ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  ${receiver}->touch( lcl_user=>mutate( ) ).`)).to.deep.equal([]);
    });
  }

  for (const transfer of ["LEAVE TO TRANSACTION 'SE38'", "RAISE EXCEPTION TYPE lcl_error", "RAISE SHORTDUMP TYPE lcl_error"]) {
    it(`does not treat ${transfer} as a normal procedure return`, () => {
      expect(run(`CLASS cx_root DEFINITION. ENDCLASS.
CLASS cx_root IMPLEMENTATION. ENDCLASS.
CLASS cx_no_check DEFINITION INHERITING FROM cx_root. ENDCLASS.
CLASS cx_no_check IMPLEMENTATION. ENDCLASS.
CLASS lcl_error DEFINITION INHERITING FROM cx_no_check. ENDCLASS.
CLASS lcl_error IMPLEMENTATION. ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  PERFORM finish.
  SORT pointer->*.
END-OF-SELECTION.
  SORT pointer->*.
FORM finish.
  ${transfer}.
ENDFORM.`)).to.deep.equal([]);
    });
  }

  it("keeps the caller continuation for a handled classic exception", () => {
    const issues = run(`CLASS lcl_user DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS fail EXCEPTIONS failed.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD fail. RAISE failed. ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  CALL METHOD lcl_user=>fail EXCEPTIONS failed = 1.
  SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("ends the program after LEAVE PROGRAM without running later events or list callbacks", () => {
    expect(run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  WRITE 'list'.
  pointer = REF #( owner->items ).
  LEAVE PROGRAM.
  SORT pointer->*.
END-OF-SELECTION.
  SORT pointer->*.
AT LINE-SELECTION.
  SORT pointer->*.
TOP-OF-PAGE.
  SORT pointer->*.`)).to.deep.equal([]);
  });

  it("propagates LEAVE PROGRAM through a resolved FORM", () => {
    expect(run(`INITIALIZATION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  PERFORM finish.
  SORT pointer->*.
START-OF-SELECTION.
  SORT pointer->*.
END-OF-SELECTION.
  SORT pointer->*.
FORM finish.
  LEAVE PROGRAM.
ENDFORM.`)).to.deep.equal([]);
  });

  it("retains returning paths when another callee path leaves the program", () => {
    const issues = run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  PERFORM maybe_finish.
  SORT pointer->*.
FORM maybe_finish.
  IF sy-subrc = 0.
    LEAVE PROGRAM.
  ENDIF.
ENDFORM.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("does not invoke an outer method after an argument leaves the program", () => {
    expect(run(`CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS finish RETURNING VALUE(result) TYPE i.
    CLASS-METHODS write_items IMPORTING number TYPE i.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD finish.
    LEAVE PROGRAM.
  ENDMETHOD.
  METHOD write_items.
    SORT pointer->*.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  lcl_user=>write_items( lcl_user=>finish( ) ).`)).to.deep.equal([]);
  });

  it("stops a selection-screen handler before unreachable protected writes", () => {
    expect(run(`AT SELECTION-SCREEN.
  STOP.
  pointer = REF #( owner->items ).
  SORT pointer->*.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).`)).to.deep.equal([]);
  });

  it("carries selection-screen STOP state directly to END", () => {
    const issues = run(`AT SELECTION-SCREEN.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  STOP.
  pointer = REF #( mutable_items ).
START-OF-SELECTION.
  pointer = REF #( mutable_items ).
END-OF-SELECTION.
  SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  for (const mode of ["INPUT", "OUTPUT"]) {
    it(`analyzes independent dialog MODULE ${mode} with protected storage`, () => {
      const issues = run(`MODULE dialog ${mode}.
  CREATE OBJECT owner.
  ASSIGN owner->items TO <items>.
  SORT <items>.
ENDMODULE.`);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Error);
    });
  }

  for (const writable of [false, true]) {
    it(`orders LOAD, INITIALIZATION, START and END (writable=${writable})`, () => {
      const blocks = [
        "LOAD-OF-PROGRAM. CREATE OBJECT owner.",
        `INITIALIZATION. pointer = REF #( ${writable ? "owner->items" : "mutable_items"} ).`,
        `START-OF-SELECTION. pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).`,
        "END-OF-SELECTION. SORT pointer->*.",
      ];
      const issues = run([3, 1, 0, 2].map(i => blocks[i]).join("\n"));
      expect(issues).to.have.length(writable ? 0 : 1);
      if (!writable) {
        expect(issues[0].getSeverity()).to.equal(Severity.Error);
      }
    });
  }

  it("prepends implicit START statements to an explicit START block", () => {
    const issues = run(`CREATE OBJECT owner.
pointer = REF #( owner->items ).
END-OF-SELECTION.
  pointer = REF #( mutable_items ).
START-OF-SELECTION.
  SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Error);
  });

  it("ends an implicit START at FORM instead of executing unattached statements", () => {
    expect(run(`CREATE OBJECT owner.
pointer = REF #( mutable_items ).
FORM unused. ENDFORM.
pointer = REF #( owner->items ).
END-OF-SELECTION.
  SORT pointer->*.`)).to.deep.equal([]);
  });

  it("ends an explicit event at FORM", () => {
    expect(run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
FORM unused. ENDFORM.
pointer = REF #( owner->items ).
END-OF-SELECTION.
  SORT pointer->*.`)).to.deep.equal([]);
  });

  for (const transfer of ["RETURN", "STOP"]) {
    it(`keeps ${transfer} state for END while ignoring the rest of START`, () => {
      const issues = run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  ${transfer}.
  pointer = REF #( mutable_items ).
END-OF-SELECTION.
  SORT pointer->*.`);
      expect(issues).to.have.length(1);
      expect(issues[0].getSeverity()).to.equal(Severity.Error);
    });
  }

  it("keeps the conditional early CHECK exit without bypassing later mandatory events", () => {
    const issues = run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  CHECK sy-subrc = 0.
  pointer = REF #( mutable_items ).
END-OF-SELECTION.
  SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("does not carry an earlier RETURN state past a later mandatory rebinding", () => {
    expect(run(`LOAD-OF-PROGRAM.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  RETURN.
INITIALIZATION.
  pointer = REF #( mutable_items ).
START-OF-SELECTION.
  SORT pointer->*.`)).to.deep.equal([]);
  });

  it("skips END after EXIT in a reporting event", () => {
    expect(run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  EXIT.
END-OF-SELECTION.
  SORT pointer->*.`)).to.deep.equal([]);
  });

  it("keeps list callbacks reachable after STOP in END", () => {
    const issues = run(`START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  WRITE 'list'.
END-OF-SELECTION.
  pointer = REF #( owner->items ).
  STOP.
  pointer = REF #( mutable_items ).
AT LINE-SELECTION.
  SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("joins optional selection-screen handlers before START", () => {
    const issues = run(`START-OF-SELECTION.
  SORT pointer->*.
AT SELECTION-SCREEN.
  pointer = REF #( owner->items ).
INITIALIZATION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("joins repeated interactive handlers without imposing their source order", () => {
    const issues = run(`AT LINE-SELECTION.
  SORT pointer->*.
AT USER-COMMAND.
  pointer = REF #( owner->items ).
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  WRITE 'list'.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  for (const {event, writable} of [
    {event: "TOP-OF-PAGE", writable: false},
    {event: "TOP-OF-PAGE", writable: true},
    {event: "END-OF-PAGE", writable: false},
  ]) {
    it(`checks ${event} during output before a later rebinding (writable=${writable})`, () => {
      const issues = run(`${event}.
  SORT pointer->*.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( ${writable ? "mutable_items" : "owner->items"} ).
  DO 6 TIMES.
    WRITE / 'line'.
  ENDDO.
  pointer = REF #( ${writable ? "owner->items" : "mutable_items"} ).`);
      expect(issues).to.have.length(writable ? 0 : 1);
      if (!writable) {
        expect(issues[0].getSeverity()).to.equal(Severity.Warning);
      }
    });
  }

  it("propagates a synchronous page callback's possible rebinding to the following statement", () => {
    const issues = run(`TOP-OF-PAGE.
  pointer = REF #( owner->items ).
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( mutable_items ).
  WRITE 'line'.
  SORT pointer->*.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("checks page callbacks during output in a resolved FORM", () => {
    const issues = run(`TOP-OF-PAGE.
  SORT pointer->*.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  PERFORM output.
  pointer = REF #( mutable_items ).
FORM output.
  WRITE 'line'.
ENDFORM.`);
    expect(issues).to.have.length(1);
    expect(issues[0].getSeverity()).to.equal(Severity.Warning);
  });

  it("does not dispatch page callbacks for WRITE TO", () => {
    expect(run(`TOP-OF-PAGE.
  SORT pointer->*.
START-OF-SELECTION.
  CREATE OBJECT owner.
  pointer = REF #( owner->items ).
  DATA text TYPE c LENGTH 20.
  WRITE 'line' TO text.
  pointer = REF #( mutable_items ).`)).to.deep.equal([]);
  });
});
