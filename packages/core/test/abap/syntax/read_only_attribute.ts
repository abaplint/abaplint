import {expect} from "chai";
import {runMulti, runProgram} from "./syntax";

// #2097, a READ-ONLY attribute can be changed through a reference or class name whose static type is
// the class doing the change or one of its super classes, or a class it is a friend of
describe("syntax.ts, writes to READ-ONLY attributes", () => {

  const definitions = `
CLASS lcl_sub DEFINITION DEFERRED.
CLASS lcl_friend DEFINITION DEFERRED.
CLASS lcl_test DEFINITION FRIENDS lcl_friend.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_s,
             comp TYPE i,
           END OF ty_s.
    DATA num TYPE i READ-ONLY.
    DATA tab TYPE string_table READ-ONLY.
    DATA s TYPE ty_s READ-ONLY.
    DATA: BEGIN OF bs READ-ONLY,
            comp TYPE i,
          END OF bs.
    DATA ref TYPE REF TO lcl_test READ-ONLY.
    DATA dref TYPE REF TO i READ-ONLY.
    DATA rw TYPE i.
    CLASS-DATA snum TYPE i READ-ONLY.
    METHODS in_class.
ENDCLASS.
CLASS lcl_sub DEFINITION INHERITING FROM lcl_test.
  PUBLIC SECTION.
    METHODS in_subclass.
ENDCLASS.
CLASS lcl_friend DEFINITION.
  PUBLIC SECTION.
    METHODS in_friend.
ENDCLASS.
CLASS lcl_other DEFINITION.
  PUBLIC SECTION.
    METHODS outside.
ENDCLASS.`;

  function run(slots: {inClass?: string, inSubclass?: string, inFriend?: string, outside?: string}) {
    return runProgram(definitions + `
CLASS lcl_test IMPLEMENTATION.
  METHOD in_class.
    ${slots.inClass ?? ""}
  ENDMETHOD.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
  METHOD in_subclass.
    ${slots.inSubclass ?? ""}
  ENDMETHOD.
ENDCLASS.
CLASS lcl_friend IMPLEMENTATION.
  METHOD in_friend.
    ${slots.inFriend ?? ""}
  ENDMETHOD.
ENDCLASS.
CLASS lcl_other IMPLEMENTATION.
  METHOD outside.
    DATA(o) = NEW lcl_test( ).
    ${slots.outside ?? ""}
  ENDMETHOD.
ENDCLASS.`);
  }

  const message = `READ-ONLY attribute "num" can only be changed in "lcl_test", its subclasses and friends`;

  it("SORT from another class, the example of the issue, error", () => {
    const issues = run({outside: "SORT o->tab."});
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`READ-ONLY attribute "tab"`);
  });

  it("assignment, CLEAR and APPEND from another class, error", () => {
    expect(run({outside: "o->num = 1."}).map(i => i.getMessage())).to.deep.equal([message]);
    expect(run({outside: "CLEAR o->num."}).map(i => i.getMessage())).to.deep.equal([message]);
    expect(run({outside: "APPEND `a` TO o->tab."}).length).to.equal(1);
  });

  it("static attribute through the class name, error", () => {
    const issues = run({outside: "lcl_test=>snum = 1."});
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`READ-ONLY attribute "snum"`);
  });

  it("component of a READ-ONLY structure, error", () => {
    expect(run({outside: "o->s-comp = 1."}).length).to.equal(1);
    expect(run({outside: "o->bs-comp = 1."}).length).to.equal(1);
  });

  it("READ-ONLY attribute reached through a READ-ONLY reference, error", () => {
    expect(run({outside: "o->ref->num = 1."}).map(i => i.getMessage())).to.deep.equal([message]);
  });

  it("write through a READ-ONLY reference, ok", () => {
    expect(run({outside: "o->ref->rw = 1. o->dref->* = 1."}).length).to.equal(0);
  });

  it("reads and writes to other attributes, ok", () => {
    expect(run({outside: "o->rw = 1. DATA(n) = o->num. CLEAR n. DATA(t) = lcl_test=>snum. CLEAR t."}).length).to.equal(0);
  });

  it("in the class itself, ok", () => {
    expect(run({inClass: "num = 1. me->num = 2. lcl_test=>snum = 3. DATA(o) = NEW lcl_test( ). o->num = 4."}).length).to.equal(0);
  });

  it("in the class itself through a reference of a subclass, error", () => {
    const issues = run({inClass: "DATA(o) = NEW lcl_sub( ). o->num = 1."});
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain(`can only be changed in "lcl_sub"`);
  });

  it("in a subclass, through its own and the super class type, ok", () => {
    const code = "num = 1. me->num = 2. DATA(o) = NEW lcl_test( ). o->num = 3. lcl_test=>snum = 4. lcl_sub=>snum = 5.";
    expect(run({inSubclass: code}).length).to.equal(0);
  });

  it("in a friend, ok", () => {
    expect(run({inFriend: "DATA(o) = NEW lcl_test( ). o->num = 1. lcl_test=>snum = 2."}).length).to.equal(0);
  });

  it("in a test class with LOCAL FRIENDS, ok", () => {
    const clas = `CLASS zcl_ro DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA num TYPE i READ-ONLY.
ENDCLASS.
CLASS zcl_ro IMPLEMENTATION.
ENDCLASS.`;
    const testclasses = `CLASS ltcl_test DEFINITION DEFERRED.
CLASS zcl_ro DEFINITION LOCAL FRIENDS ltcl_test.
CLASS ltcl_test DEFINITION FOR TESTING RISK LEVEL HARMLESS DURATION SHORT.
  PRIVATE SECTION.
    METHODS test FOR TESTING.
ENDCLASS.
CLASS ltcl_test IMPLEMENTATION.
  METHOD test.
    DATA(o) = NEW zcl_ro( ).
    o->num = 1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = runMulti([
      {filename: "zcl_ro.clas.abap", contents: clas},
      {filename: "zcl_ro.clas.testclasses.abap", contents: testclasses}]);
    expect(issues.length).to.equal(0);
  });

  it("from the main program, error", () => {
    const issues = runProgram(definitions + `
CLASS lcl_test IMPLEMENTATION.
  METHOD in_class.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
  METHOD in_subclass.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_friend IMPLEMENTATION.
  METHOD in_friend.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_other IMPLEMENTATION.
  METHOD outside.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  DATA(go) = NEW lcl_test( ).
  go->num = 1.`);
    expect(issues.map(i => i.getMessage())).to.deep.equal([message]);
  });

  describe("interface attributes", () => {
    const intf = `INTERFACE zif_x PUBLIC.
  DATA mv_ro TYPE i READ-ONLY.
ENDINTERFACE.`;
    const obj = (body: string) => `CLASS zcl_obj DEFINITION PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_x.
    METHODS m.
ENDCLASS.
CLASS zcl_obj IMPLEMENTATION.
  METHOD m.
    ${body}
  ENDMETHOD.
ENDCLASS.`;

    it("from another class, through the interface and through the class, error", () => {
      const x = `CLASS zcl_x DEFINITION PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS run.
ENDCLASS.
CLASS zcl_x IMPLEMENTATION.
  METHOD run.
    DATA lo_i TYPE REF TO zif_x.
    DATA lo_o TYPE REF TO zcl_obj.
    CREATE OBJECT lo_o.
    lo_i = lo_o.
    lo_i->mv_ro = 1.
    lo_o->zif_x~mv_ro = 2.
  ENDMETHOD.
ENDCLASS.`;
      const issues = runMulti([
        {filename: "zif_x.intf.abap", contents: intf},
        {filename: "zcl_obj.clas.abap", contents: obj("")},
        {filename: "zcl_x.clas.abap", contents: x}]);
      expect(issues.map(i => i.getMessage())).to.deep.equal([
        `READ-ONLY attribute "mv_ro" cannot be changed through interface "zif_x"`,
        `READ-ONLY attribute "zif_x~mv_ro" can only be changed in "zcl_obj", its subclasses and friends`]);
    });

    it("in the implementing class through an interface reference, error", () => {
      const issues = runMulti([
        {filename: "zif_x.intf.abap", contents: intf},
        {filename: "zcl_obj.clas.abap", contents: obj("DATA lo_i TYPE REF TO zif_x.\n    lo_i = me.\n    lo_i->mv_ro = 1.")}]);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.contain(`through interface "zif_x"`);
    });

    it("in the implementing class through the class, ok", () => {
      const issues = runMulti([
        {filename: "zif_x.intf.abap", contents: intf},
        {filename: "zcl_obj.clas.abap", contents: obj("me->zif_x~mv_ro = 1.\n    zif_x~mv_ro = 2.\n    DATA(o) = NEW zcl_obj( ).\n    o->zif_x~mv_ro = 3.")}]);
      expect(issues.length).to.equal(0);
    });
  });

});
