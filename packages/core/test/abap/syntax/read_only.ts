import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files/memory_file";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Unknown} from "../../../src/abap/2_statements/statements/_statement";

function runProgram(abap: string): string[] {
  const reg = new Registry().addFile(new MemoryFile("zread_only.prog.abap", abap)).parse();
  const obj = reg.getFirstObject()! as ABAPObject;
  for (const file of obj.getABAPFiles()) {
    expect(file.getStructure(), "parsed structure").to.not.equal(undefined);
    expect(file.getStatements().some(s => s.get() instanceof Unknown), "unknown statement").to.equal(false);
  }
  return new SyntaxLogic(reg, obj).run().issues.map(i => i.getMessage());
}

function ownerProgram(ownBody = "", friendBody = ""): string {
  return `
CLASS lcl_friend DEFINITION DEFERRED.
CLASS lcl_mutable DEFINITION.
  PUBLIC SECTION.
    DATA value TYPE i.
    METHODS touch.
    METHODS get_value RETURNING VALUE(result) TYPE i.
ENDCLASS.
CLASS lcl_mutable IMPLEMENTATION.
  METHOD touch.
  ENDMETHOD.
  METHOD get_value.
  ENDMETHOD.
ENDCLASS.

CLASS lcl_owner DEFINITION FRIENDS lcl_friend.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_row,
             value TYPE i,
           END OF ty_row.
    TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
    DATA count TYPE i READ-ONLY.
    DATA letters TYPE c LENGTH 8 READ-ONLY.
    DATA day TYPE d READ-ONLY.
    DATA items TYPE STANDARD TABLE OF string WITH DEFAULT KEY READ-ONLY.
    DATA rows TYPE ty_rows READ-ONLY.
    DATA object TYPE REF TO lcl_mutable READ-ONLY.
    DATA objects TYPE STANDARD TABLE OF REF TO lcl_mutable WITH DEFAULT KEY READ-ONLY.
    DATA pointer TYPE REF TO i READ-ONLY.
    DATA: BEGIN OF settings READ-ONLY,
            value TYPE i,
          END OF settings.
    CLASS-DATA total TYPE i READ-ONLY.
    CLASS-DATA: BEGIN OF shared READ-ONLY,
                  value TYPE i,
                END OF shared.
    DATA mutable TYPE i.
    METHODS update.
ENDCLASS.
CLASS lcl_owner IMPLEMENTATION.
  METHOD update.
    DATA other TYPE REF TO lcl_owner.
    ${ownBody}
  ENDMETHOD.
ENDCLASS.

CLASS lcl_friend DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl_friend IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    ${friendBody}
  ENDMETHOD.
ENDCLASS.`;
}

function external(body: string): string {
  return ownerProgram() + `
CLASS lcl_user DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl_user IMPLEMENTATION.
  METHOD run.
    DATA owner TYPE REF TO lcl_owner.
    DATA row TYPE lcl_owner=>ty_row.
    DATA text TYPE string.
    ${body}
  ENDMETHOD.
ENDCLASS.`;
}

function interfaceProgram(ownBody = "", childBody = "", externalBody = ""): string {
  return `
INTERFACE lif_ro.
  DATA count TYPE i READ-ONLY.
  DATA mutable TYPE i.
ENDINTERFACE.
CLASS lcl_implementation DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_ro.
    METHODS run.
ENDCLASS.
CLASS lcl_implementation IMPLEMENTATION.
  METHOD run.
    DATA other TYPE REF TO lcl_implementation.
    DATA view TYPE REF TO lif_ro.
    ${ownBody}
  ENDMETHOD.
ENDCLASS.
CLASS lcl_child DEFINITION INHERITING FROM lcl_implementation.
  PUBLIC SECTION.
    METHODS update.
ENDCLASS.
CLASS lcl_child IMPLEMENTATION.
  METHOD update.
    DATA other TYPE REF TO lcl_implementation.
    ${childBody}
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  DATA owner TYPE REF TO lcl_implementation.
  DATA view TYPE REF TO lif_ro.
  ${externalBody}`;
}

const message = (name: string) => `Attribute "${name}" is read-only and cannot be modified`;

describe("syntax, READ-ONLY attributes", () => {
  const writes = [
    {name: "SORT from another class", body: "SORT owner->items.", attribute: "items"},
    {name: "scalar assignment", body: "owner->count = 2.", attribute: "count"},
    {name: "CLEAR", body: "CLEAR owner->count.", attribute: "count"},
    {name: "APPEND", body: "APPEND 'value' TO owner->items.", attribute: "items"},
    {name: "short APPEND", body: "APPEND owner->items.", attribute: "items"},
    {name: "short APPEND with field-symbol binding", body: "APPEND owner->items ASSIGNING FIELD-SYMBOL(<item>).", attribute: "items"},
    {name: "DELETE", body: "DELETE owner->items INDEX 1.", attribute: "items"},
    {name: "MODIFY", body: "MODIFY owner->items FROM text INDEX 1.", attribute: "items"},
    {name: "INSERT", body: "INSERT text INTO TABLE owner->items.", attribute: "items"},
    {name: "FREE", body: "FREE owner->items.", attribute: "items"},
    {name: "whole-table assignment", body: "owner->items = VALUE #( ).", attribute: "items"},
    {name: "structure component", body: "owner->settings-value = 1.", attribute: "settings"},
    {name: "CLEAR of a structure component", body: "CLEAR owner->settings-value.", attribute: "settings"},
    {name: "table-expression component", body: "owner->rows[ 1 ]-value = 1.", attribute: "rows"},
    {name: "static attribute", body: "lcl_owner=>total = 1.", attribute: "total"},
    {name: "static structure component", body: "lcl_owner=>shared-value = 1.", attribute: "shared"},
    {name: "reference replacement", body: "owner->object = NEW lcl_mutable( ).", attribute: "object"},
    {name: "transformation result", body: "CALL TRANSFORMATION id SOURCE value = text RESULT value = owner->count.", attribute: "count"},
    {name: "object reached through a table expression", body: "owner->objects[ 1 ]->value = 1.", attribute: "objects"},
    {name: "COMPUTE", body: "COMPUTE owner->count = 2.", attribute: "count"},
    {name: "APPEND existing reference output", body: "DATA values TYPE STANDARD TABLE OF i WITH DEFAULT KEY. APPEND INITIAL LINE TO values REFERENCE INTO owner->pointer.", attribute: "pointer"},
    {name: "indexed INSERT existing reference output", body: "DATA values TYPE STANDARD TABLE OF i WITH DEFAULT KEY. INSERT INITIAL LINE INTO values INDEX 1 REFERENCE INTO owner->pointer.", attribute: "pointer"},
    {name: "INSERT INTO TABLE existing reference output", body: "DATA values TYPE STANDARD TABLE OF i WITH DEFAULT KEY. INSERT INITIAL LINE INTO TABLE values REFERENCE INTO owner->pointer.", attribute: "pointer"},
    {name: "short APPEND existing reference output", body: "DATA values TYPE i OCCURS 0 WITH HEADER LINE. APPEND values REFERENCE INTO owner->pointer.", attribute: "pointer"},
    {name: "OVERLAY", body: "OVERLAY owner->letters WITH '12345678'.", attribute: "letters"},
    {name: "GET DATASET position", body: "GET DATASET text POSITION owner->count.", attribute: "count"},
    {name: "GET DATASET attributes", body: "GET DATASET text ATTRIBUTES owner->settings.", attribute: "settings"},
    {name: "DESCRIBE decimals", body: "DESCRIBE FIELD text DECIMALS owner->count.", attribute: "count"},
    {name: "DESCRIBE output length", body: "DESCRIBE FIELD text OUTPUT-LENGTH owner->count.", attribute: "count"},
    {name: "DESCRIBE help ID", body: "DESCRIBE FIELD text HELP-ID owner->letters.", attribute: "letters"},
    {name: "DESCRIBE edit mask", body: "DESCRIBE FIELD text EDIT MASK owner->letters.", attribute: "letters"},
    {name: "DESCRIBE distance", body: "DESCRIBE DISTANCE BETWEEN text AND row INTO owner->count.", attribute: "count"},
    {name: "DESCRIBE table kind", body: "DESCRIBE TABLE owner->items KIND owner->letters.", attribute: "letters"},
    {name: "DESCRIBE table occurs", body: "DESCRIBE TABLE owner->items OCCURS owner->count.", attribute: "count"},
    {name: "DESCRIBE list", body: "DESCRIBE LIST NUMBER OF PAGES owner->count.", attribute: "count"},
    {name: "CONVERT inverted date", body: "CONVERT DATE sy-datum INTO INVERTED-DATE owner->letters.", attribute: "letters"},
    {name: "CONVERT date output", body: "CONVERT INVERTED-DATE '79989898' INTO DATE owner->day.", attribute: "day"},
    {name: "CONVERT TEXT", body: "CONVERT TEXT text INTO SORTABLE CODE owner->letters.", attribute: "letters"},
    {name: "standalone method through a readonly table", body: "owner->objects[ 1 ]->touch( ).", attribute: "objects"},
    {name: "OLE method output", body: "CALL METHOD OF text 'VALUE' = owner->count.", attribute: "count"},
    {name: "OLE object output", body: "CREATE OBJECT owner->count 'Excel.Application'.", attribute: "count"},
    {name: "OLE property output", body: "GET PROPERTY OF text 'VALUE' = owner->count.", attribute: "count"},
    {name: "FREE OBJECT", body: "FREE OBJECT owner->count.", attribute: "count"},
    {name: "GENERATE REPORT message", body: "GENERATE REPORT text MESSAGE owner->letters.", attribute: "letters"},
    {name: "GENERATE SUBROUTINE name", body: "GENERATE SUBROUTINE POOL owner->items NAME owner->letters.", attribute: "letters"},
    {name: "GENERATE DYNPRO message", body: "GENERATE DYNPRO text text text text ID text MESSAGE owner->letters LINE text.", attribute: "letters"},
    {name: "LOAD REPORT output", body: "LOAD REPORT text PART text INTO owner->items.", attribute: "items"},
    {name: "READ LINE value", body: "READ LINE 1 LINE VALUE INTO owner->letters.", attribute: "letters"},
    {name: "READ LINE field without INTO", body: "READ LINE 1 FIELD VALUE owner->letters.", attribute: "letters"},
    {name: "READ LINE field output", body: "READ LINE 1 FIELD VALUE text INTO owner->letters.", attribute: "letters"},
    {name: "EDITOR-CALL table", body: "EDITOR-CALL FOR owner->items.", attribute: "items"},
    {name: "IMPORT code page output", body: "IMPORT text FROM MEMORY ID 'test' CODE PAGE INTO owner->count.", attribute: "count"},
    {name: "IMPORT endian output", body: "IMPORT text FROM MEMORY ID 'test' ENDIAN INTO owner->letters.", attribute: "letters"},
    {name: "SYSTEM-CALL cloned object", body: "SYSTEM-CALL OBJMGR CLONE owner->object TO owner->object.", attribute: "object"},
    {name: "COMMUNICATION return code", body: "COMMUNICATION ALLOCATE ID text RETURNCODE owner->count.", attribute: "count"},
    {name: "COMMUNICATION received buffer", body: "COMMUNICATION RECEIVE ID text BUFFER owner->letters DATAINFO text STATUSINFO text RECEIVED text.", attribute: "letters"},
    {name: "COMMUNICATION conversation ID", body: "COMMUNICATION INIT ID owner->letters DESTINATION text.", attribute: "letters"},
  ];

  for (const test of writes) {
    it(`rejects ${test.name}`, () => {
      expect(runProgram(external(test.body))).to.deep.equal([message(test.attribute)]);
    });
    it(`allows ${test.name} inside the owning class`, () => {
      expect(runProgram(ownerProgram(`
    DATA owner TYPE REF TO lcl_owner.
    DATA row TYPE lcl_owner=>ty_row.
    DATA text TYPE string.
    ${test.body}`))).to.deep.equal([]);
    });
  }

  it("allows reading scalar, structure and table attributes", () => {
    const issues = runProgram(external(`
    DATA(number) = owner->count.
    number = owner->settings-value.
    READ TABLE owner->items INTO text INDEX 1.
    number = owner->rows[ 1 ]-value.
    number = lcl_owner=>total.`));
    expect(issues).to.deep.equal([]);
  });

  it("allows read operands in legacy statements", () => {
    expect(runProgram(external(`
    GET DATASET owner->letters POSITION owner->mutable.
    GENERATE REPORT owner->letters TRACE-FILE owner->letters DIRECTORY ENTRY owner->settings.
    READ LINE 1 FIELD VALUE owner->letters INTO text.
    COMMUNICATION SEND ID text BUFFER owner->letters LENGTH owner->count.
    COMMUNICATION INIT ID text DESTINATION owner->letters.
    EDITOR-CALL FOR owner->items DISPLAY-MODE.
    EDITOR-CALL FOR REPORT owner->letters.`))).to.deep.equal([]);
  });

  it("allows functional calls through a readonly table in read positions", () => {
    expect(runProgram(external("DATA(value) = owner->objects[ 1 ]->get_value( )."))).to.deep.equal([]);
  });

  it("allows standalone calls through a readonly object reference", () => {
    expect(runProgram(external("owner->object->touch( )."))).to.deep.equal([]);
  });

  it("allows a readonly reference reached through an ordinary table", () => {
    expect(runProgram(external(`
    DATA owners TYPE STANDARD TABLE OF REF TO lcl_owner WITH DEFAULT KEY.
    owners[ 1 ]->object->touch( ).`))).to.deep.equal([]);
  });

  it("rejects standalone calls through interface tables and their aliases", () => {
    const abap = ownerProgram() + `
INTERFACE lif_tables.
  DATA objects TYPE STANDARD TABLE OF REF TO lcl_mutable WITH DEFAULT KEY READ-ONLY.
ENDINTERFACE.
CLASS lcl_tables DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_tables.
    ALIASES objects FOR lif_tables~objects.
ENDCLASS.
CLASS lcl_tables IMPLEMENTATION.
ENDCLASS.
START-OF-SELECTION.
  DATA view TYPE REF TO lif_tables.
  DATA owner TYPE REF TO lcl_tables.
  view->objects[ 1 ]->touch( ).
  owner->objects[ 1 ]->touch( ).`;
    expect(runProgram(abap)).to.deep.equal([message("objects"), message("objects")]);
  });

  it("allows writing an ordinary mutable attribute", () => {
    expect(runProgram(external("owner->mutable = 1."))).to.deep.equal([]);
  });

  it("resolves inline and existing reference outputs of indexed INSERT", () => {
    expect(runProgram(external(`
    DATA values TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    DATA pointer TYPE REF TO i.
    INSERT INITIAL LINE INTO values INDEX 1 REFERENCE INTO pointer.
    pointer->* = 1.
    INSERT INITIAL LINE INTO values INDEX 1 REFERENCE INTO DATA(inline_pointer).
    inline_pointer->* = 2.`))).to.deep.equal([]);
  });

  it("allows own, self-qualified and other-instance writes inside the owning class", () => {
    const issues = runProgram(ownerProgram(`
    count = 1.
    me->settings-value = 2.
    other->count = 3.
    APPEND 'value' TO items.
    lcl_owner=>total = 4.`));
    expect(issues).to.deep.equal([]);
  });

  it("allows inherited writes inside a subclass", () => {
    const issues = runProgram(ownerProgram() + `
CLASS lcl_child DEFINITION INHERITING FROM lcl_owner.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS lcl_child IMPLEMENTATION.
  METHOD run.
    DATA other TYPE REF TO lcl_owner.
    count = 1.
    me->settings-value = 2.
    other->count = 3.
    SORT items.
    lcl_owner=>total = 4.
  ENDMETHOD.
ENDCLASS.`);
    expect(issues).to.deep.equal([]);
  });

  it("allows writes inside a friend class", () => {
    const issues = runProgram(ownerProgram("", `
    owner->count = 1.
    owner->settings-value = 2.
    SORT owner->items.
    lcl_owner=>total = 3.`));
    expect(issues).to.deep.equal([]);
  });

  it("allows modifying the object referenced by a read-only reference attribute", () => {
    expect(runProgram(external("owner->object->value = 1."))).to.deep.equal([]);
  });

  it("allows modifying data referenced by a read-only reference attribute", () => {
    expect(runProgram(external("owner->pointer->* = 1."))).to.deep.equal([]);
  });

  it("allows a transformation result in the referenced object", () => {
    const issues = runProgram(external("CALL TRANSFORMATION id SOURCE value = text RESULT value = owner->object->value."));
    expect(issues).to.deep.equal([]);
  });

  it("allows a read-only attribute as a transformation source", () => {
    const issues = runProgram(external("CALL TRANSFORMATION id SOURCE value = owner->count RESULT XML text."));
    expect(issues).to.deep.equal([]);
  });

  it("allows ASSIGN followed by a read through the field symbol", () => {
    const issues = runProgram(external(`
    ASSIGN owner->items TO FIELD-SYMBOL(<items>).
    text = <items>[ 1 ].`));
    expect(issues).to.deep.equal([]);
  });

  it("allows read-only operands in ASSIGN INCREMENT", () => {
    expect(runProgram(external(`
    FIELD-SYMBOLS <value> TYPE i.
    ASSIGN owner->count INCREMENT 0 TO <value>.
    DATA(number) = <value>.
    ASSIGN owner->mutable INCREMENT owner->count TO <value>.`))).to.deep.equal([]);
  });

  it("allows LOOP ASSIGNING followed by reads through the field symbol", () => {
    const issues = runProgram(external(`
    LOOP AT owner->items ASSIGNING FIELD-SYMBOL(<item>).
      text = <item>.
    ENDLOOP.`));
    expect(issues).to.deep.equal([]);
  });
});

describe("syntax, READ-ONLY interface attributes", () => {
  it("rejects an external write through an interface reference", () => {
    const issues = runProgram(interfaceProgram("", "", "view->count = 1."));
    expect(issues).to.deep.equal([message("count")]);
  });

  it("rejects an external write through an implementing-class reference", () => {
    const issues = runProgram(interfaceProgram("", "", "owner->lif_ro~count = 1."));
    expect(issues).to.deep.equal([message("lif_ro~count")]);
  });

  it("rejects an interface-reference write inside the implementing class", () => {
    const issues = runProgram(interfaceProgram("view->count = 1."));
    expect(issues).to.deep.equal([message("count")]);
  });

  it("allows a class-reference write inside the implementing class", () => {
    const issues = runProgram(interfaceProgram("other->lif_ro~count = 1."));
    expect(issues).to.deep.equal([]);
  });

  it("allows self-qualified writes inside the implementing class", () => {
    const issues = runProgram(interfaceProgram("me->lif_ro~count = 1."));
    expect(issues).to.deep.equal([]);
  });

  it("allows writes through self and class references inside a subclass", () => {
    const issues = runProgram(interfaceProgram("", `
    me->lif_ro~count = 1.
    other->lif_ro~count = 2.`));
    expect(issues).to.deep.equal([]);
  });

  it("allows reading through an interface reference", () => {
    const issues = runProgram(interfaceProgram("", "", "DATA(number) = view->count."));
    expect(issues).to.deep.equal([]);
  });

  it("allows writing an ordinary mutable interface attribute", () => {
    const issues = runProgram(interfaceProgram("", "", "view->mutable = 1."));
    expect(issues).to.deep.equal([]);
  });
});
