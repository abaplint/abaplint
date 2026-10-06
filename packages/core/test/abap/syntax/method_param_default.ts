import {expect} from "chai";
import {runMulti} from "./syntax";

function run(signature: string) {
  const code = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS meth ${signature}.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD meth.
  ENDMETHOD.
ENDCLASS.`;
  return runMulti([{filename: "zfoo.prog.abap", contents: code}]);
}

describe("syntax.ts, a method parameter named DEFAULT", () => {

  it("IMPORTING, after another parameter", () => {
    const issues = run(`IMPORTING val TYPE clike default TYPE i RETURNING VALUE(result) TYPE i`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("DEFAULT addition");
  });

  it("upper case", () => {
    const issues = run(`IMPORTING val TYPE clike DEFAULT TYPE i`);
    expect(issues.length).to.equals(1);
  });

  it("CHANGING", () => {
    expect(run(`CHANGING val TYPE i default TYPE i`).length).to.equals(1);
  });

  it("EXPORTING has no DEFAULT addition, nothing to mistake it for", () => {
    expect(run(`EXPORTING val TYPE i default TYPE i`).length).to.equals(0);
  });

  it("after an OPTIONAL parameter", () => {
    expect(run(`IMPORTING val TYPE i OPTIONAL default TYPE i`).length).to.equals(1);
  });

  it("escaped with !", () => {
    expect(run(`IMPORTING val TYPE clike !default TYPE i`).length).to.equals(0);
  });

  it("first parameter of the section, not measured on a system", () => {
    expect(run(`IMPORTING default TYPE i val TYPE i`).length).to.equals(0);
  });

  it("pass by value", () => {
    expect(run(`IMPORTING val TYPE clike VALUE(default) TYPE i`).length).to.equals(0);
  });

  it("the DEFAULT addition itself", () => {
    expect(run(`IMPORTING val TYPE i DEFAULT 5 other TYPE i`).length).to.equals(0);
  });

  it("other names", () => {
    expect(run(`IMPORTING val TYPE i fallback TYPE i default_value TYPE i`).length).to.equals(0);
  });

  it("a structure component named default", () => {
    const code = `TYPES: BEGIN OF ty_s,
         optional TYPE string,
         default  TYPE string,
       END OF ty_s.`;
    expect(runMulti([{filename: "zfoo.prog.abap", contents: code}]).length).to.equals(0);
  });

});
