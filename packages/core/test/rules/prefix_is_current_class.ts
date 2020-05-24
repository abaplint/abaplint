import {expect} from "chai";
import {PrefixIsCurrentClass, PrefixIsCurrentClassConf} from "../../src/rules";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";

function run(abap: string, config?: PrefixIsCurrentClassConf): number {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new PrefixIsCurrentClass();
  if (config) {
    rule.setConfig(config);
  }
  const issues = rule.run(reg.getObjects()[0], reg);
  return issues.length;
}

describe("prefix is current class, default Config", () => {

  it("static reference to own class type", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      TYPES: BEGIN OF ty_foo,
               foo TYPE i,
             END OF ty_foo.
      METHODS foobar RETURNING VALUE(rv_string) TYPE zcl_foo=>ty_foo.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(1);
  });

  it("static reference to own class type without class name", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      TYPES: BEGIN OF ty_foo,
               foo TYPE i,
             END OF ty_foo.
      METHODS foobar RETURNING VALUE(rv_string) TYPE ty_foo.
    PROTECTED SECTION.
      DATA mv_foo TYPE i.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(0);
  });

  it("static reference to own class in string and comment", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      METHODS foobar.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foobar.
      DATA(_string) = |zcl_foo=>foo( )|.
      WRITE: 'zcl_foo=>foo( )'.
      WRITE: 'foo'. " zcl_foo=>foo( )
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(0);
  });

  it("static reference to own class in string template source", async () => {
    const abap = `CLASS lcl_moo DEFINITION.
    PUBLIC SECTION.
      METHODS abc.
    PROTECTED SECTION.
      CLASS-DATA mv_abc TYPE i.
  ENDCLASS.
  CLASS lcl_moo IMPLEMENTATION.
    METHOD abc.
      WRITE: | { lcl_moo=>mv_abc } |.
      WRITE: | { mv_abc } |.
      WRITE: |lcl_moo=>mv_abc{ 2 }lcl_moo=>mv_abc{ 3 }lcl_moo=>mv_abc{ 4 }|.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(1);
  });

  it("static reference to own class class-method", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      METHODS foobar.
      CLASS-METHODS moobar.
    PROTECTED SECTION.
      DATA mv_foo TYPE i.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foobar.
      zcl_foo=>moobar( ).
    ENDMETHOD.

    METHOD moobar.
      WRITE: '1'.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(1);
  });

  it("me-> reference instance method", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      METHODS foobar.
      METHODS moobar.
    PROTECTED SECTION.
      DATA mv_foo TYPE i.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foobar.
      me->moobar( ).
    ENDMETHOD.

    METHOD moobar.
      WRITE: '1'.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(1);
  });

  it("me-> reference instance attribute", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      METHODS foobar.
    PROTECTED SECTION.
      DATA mv_foo TYPE i.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foobar.
      me->mv_foo = 1.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap);
    expect(issues).to.equal(0);
  });

  it("interface prefix, error", async () => {
    const abap = `INTERFACE lif_foo.
    TYPES: foo TYPE i.
    TYPES boo TYPE lif_foo=>foo.
  ENDINTERFACE.`;
    const issues = run(abap);
    expect(issues).to.equal(1);
  });

  it("interface prefix, ok", async () => {
    const abap = `INTERFACE lif_foo.
    TYPES: foo TYPE i.
    TYPES boo TYPE foo.
  ENDINTERFACE.`;
    const issues = run(abap);
    expect(issues).to.equal(0);
  });

});


describe("prefix is current class, meReferenceAllowedTests", () => {

  const config = new PrefixIsCurrentClassConf();
  config.omitMeInstanceCalls = false;

  it("me-> reference instance method", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      METHODS foobar.
      METHODS moobar.
    PROTECTED SECTION.
      DATA mv_foo TYPE i.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foobar.
      me->moobar( ).
    ENDMETHOD.

    METHOD moobar.
      WRITE: '1'.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap, config);
    expect(issues).to.equal(0);
  });

  it("me-> reference instance attribute", async () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC.
    PUBLIC SECTION.
      METHODS foobar.
    PROTECTED SECTION.
      DATA mv_foo TYPE i.
  ENDCLASS.
  CLASS zcl_foo IMPLEMENTATION.
    METHOD foobar.
      me->mv_foo = 1.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = run(abap, config);
    expect(issues).to.equal(0);
  });

});