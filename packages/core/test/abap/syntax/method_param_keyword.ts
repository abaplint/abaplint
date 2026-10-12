import {expect} from "chai";
import {runMulti} from "./syntax";

function run(signature: string, call = "") {
  const code = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS meth ${signature}.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD meth.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  DATA lv1 TYPE i.
  DATA lv2 TYPE i.
  ${call}`;
  return runMulti([{filename: "zfoo.prog.abap", contents: code}]);
}

// every case below is measured with SYNTAX-CHECK on SAP_BASIS 758 SP03
describe("syntax.ts, a method parameter named like a keyword", () => {

  describe("DEFAULT and OPTIONAL, after a parameter without OPTIONAL or DEFAULT", () => {
    it("IMPORTING", () => {
      const issues = run(`IMPORTING val TYPE clike default TYPE i RETURNING VALUE(result) TYPE i`);
      expect(issues.length).to.equals(1);
      expect(issues[0].getMessage()).to.contain("DEFAULT addition of the parameter before it");
    });

    it("upper case", () => {
      expect(run(`IMPORTING val TYPE clike DEFAULT TYPE i`).length).to.equals(1);
    });

    it("CHANGING", () => {
      expect(run(`CHANGING val TYPE i default TYPE i`).length).to.equals(1);
    });

    it("EXPORTING, the system reads the DEFAULT addition there too", () => {
      expect(run(`EXPORTING val TYPE i default TYPE i`).length).to.equals(1);
    });

    it("with typings LIKE, TYPE REF TO and TYPE string", () => {
      expect(run(`IMPORTING val TYPE i default LIKE sy-tabix`).length).to.equals(1);
      expect(run(`IMPORTING val TYPE i default TYPE REF TO data`).length).to.equals(1);
      expect(run(`IMPORTING val TYPE string default TYPE string`).length).to.equals(1);
    });

    it("with OPTIONAL itself, as if_adt_rest_request in abaplint/deps", () => {
      expect(run(`IMPORTING name TYPE string default TYPE string OPTIONAL mandatory TYPE abap_bool OPTIONAL`).length).to.equals(1);
    });

    it("OPTIONAL", () => {
      const issues = run(`IMPORTING val TYPE i optional TYPE i`);
      expect(issues.length).to.equals(1);
      expect(issues[0].getMessage()).to.contain("OPTIONAL addition of the parameter before it");
      expect(run(`CHANGING val TYPE i optional TYPE i`).length).to.equals(1);
      expect(run(`EXPORTING val TYPE i optional TYPE i`).length).to.equals(1);
      expect(run(`IMPORTING val TYPE i optional TYPE i DEFAULT 1`).length).to.equals(1);
    });

    it("in an interface", () => {
      const code = `INTERFACE lif.
  METHODS meth IMPORTING val TYPE i default TYPE i.
ENDINTERFACE.`;
      expect(runMulti([{filename: "zfoo.prog.abap", contents: code}]).length).to.equals(1);
    });
  });

  describe("DEFAULT and OPTIONAL, accepted", () => {
    it("first parameter of the section", () => {
      expect(run(`IMPORTING default TYPE i val TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING optional TYPE i val TYPE i`).length).to.equals(0);
    });

    it("first parameter after another section", () => {
      expect(run(`IMPORTING val TYPE i CHANGING default TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING val TYPE i CHANGING optional TYPE i`).length).to.equals(0);
    });

    it("after an OPTIONAL parameter", () => {
      expect(run(`IMPORTING val TYPE i OPTIONAL default TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING val TYPE i OPTIONAL optional TYPE i`).length).to.equals(0);
    });

    it("after a parameter with a DEFAULT value", () => {
      expect(run(`IMPORTING val TYPE i DEFAULT 5 default TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING val TYPE i DEFAULT 5 optional TYPE i`, `lcl=>meth( val = 1 optional = 2 ).`).length).to.equals(0);
    });

    it("as PREFERRED PARAMETER", () => {
      expect(run(`IMPORTING val TYPE i OPTIONAL default TYPE i OPTIONAL PREFERRED PARAMETER default`).length).to.equals(0);
    });

    it("escaped with !", () => {
      expect(run(`IMPORTING val TYPE clike !default TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING val TYPE i !optional TYPE i`).length).to.equals(0);
    });

    it("pass by value, by reference and RETURNING", () => {
      expect(run(`IMPORTING val TYPE i VALUE(default) TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING val TYPE i REFERENCE(optional) TYPE i`).length).to.equals(0);
      expect(run(`RETURNING VALUE(default) TYPE i`).length).to.equals(0);
    });

    it("the DEFAULT addition itself", () => {
      expect(run(`IMPORTING val TYPE i DEFAULT 5 other TYPE i`).length).to.equals(0);
    });
  });

  describe("an addition that can follow the parameter", () => {
    it("PREFERRED in IMPORTING", () => {
      const issues = run(`IMPORTING val TYPE i preferred TYPE i`);
      expect(issues.length).to.equals(1);
      expect(issues[0].getMessage()).to.contain("PREFERRED PARAMETER addition");
      expect(run(`IMPORTING val TYPE i OPTIONAL preferred TYPE i`).length).to.equals(1);
      expect(run(`IMPORTING preferred TYPE i val TYPE i`).length).to.equals(1);
    });

    it("EXPORTING in IMPORTING", () => {
      expect(run(`IMPORTING val TYPE i exporting TYPE i`).length).to.equals(1);
      expect(run(`IMPORTING exporting TYPE i val TYPE i`).length).to.equals(1);
    });

    it("CHANGING in IMPORTING and EXPORTING", () => {
      expect(run(`IMPORTING val TYPE i changing TYPE i`).length).to.equals(1);
      expect(run(`IMPORTING changing TYPE i val TYPE i`).length).to.equals(1);
      expect(run(`EXPORTING val TYPE i changing TYPE i`).length).to.equals(1);
    });

    it("RETURNING", () => {
      expect(run(`IMPORTING val TYPE i returning TYPE i`).length).to.equals(1);
      expect(run(`IMPORTING returning TYPE i val TYPE i`).length).to.equals(1);
      expect(run(`EXPORTING val TYPE i returning TYPE i`).length).to.equals(1);
      expect(run(`CHANGING val TYPE i returning TYPE i`).length).to.equals(1);
    });

    it("RAISING", () => {
      const issues = run(`IMPORTING val TYPE i raising TYPE i`);
      expect(issues.length).to.equals(1);
      expect(issues[0].getMessage()).to.contain("RAISING addition");
      expect(run(`IMPORTING val TYPE i OPTIONAL raising TYPE i`).length).to.equals(1);
      expect(run(`IMPORTING raising TYPE i val TYPE i`).length).to.equals(1);
      expect(run(`EXPORTING val TYPE i raising TYPE i`).length).to.equals(1);
      expect(run(`CHANGING val TYPE i raising TYPE i`).length).to.equals(1);
    });

    it("EXCEPTIONS, first parameter", () => {
      expect(run(`IMPORTING exceptions TYPE i val TYPE i`).length).to.equals(1);
    });

    it("EXCEPTIONS after a parameter activates, as the EXCEPTIONS addition without the parameter", () => {
      expect(run(`IMPORTING val TYPE i exceptions TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING val TYPE i exceptions TYPE i`, `lcl=>meth( val = 1 exceptions = 2 ).`).length).to.equals(1);
    });
  });

  describe("an addition that cannot follow the parameter, accepted", () => {
    it("PREFERRED in EXPORTING and CHANGING", () => {
      expect(run(`EXPORTING val TYPE i preferred TYPE i`).length).to.equals(0);
      expect(run(`CHANGING val TYPE i preferred TYPE i`).length).to.equals(0);
    });

    it("EXPORTING in EXPORTING and CHANGING", () => {
      expect(run(`EXPORTING val TYPE i exporting TYPE i`).length).to.equals(0);
      expect(run(`CHANGING val TYPE i exporting TYPE i`).length).to.equals(0);
    });

    it("CHANGING in CHANGING", () => {
      expect(run(`CHANGING val TYPE i changing TYPE i`).length).to.equals(0);
    });

    it("IMPORTING", () => {
      expect(run(`IMPORTING val TYPE i importing TYPE i`).length).to.equals(0);
      expect(run(`IMPORTING importing TYPE i val TYPE i`).length).to.equals(0);
      expect(run(`EXPORTING val TYPE i importing TYPE i`).length).to.equals(0);
    });

    it("escaped with !", () => {
      for (const name of ["preferred", "exporting", "changing", "returning", "raising", "exceptions"]) {
        expect(run(`IMPORTING val TYPE i !${name} TYPE i`).length).to.equals(0, name);
      }
    });

    it("pass by value", () => {
      for (const name of ["preferred", "exporting", "changing", "returning", "raising", "exceptions"]) {
        expect(run(`IMPORTING val TYPE i VALUE(${name}) TYPE i`).length).to.equals(0, name);
      }
    });
  });

  it("other keywords as names", () => {
    for (const name of ["parameter", "type", "like", "value", "reference", "abstract", "final",
      "redefinition", "for", "testing", "event", "fail", "ignore", "resumable"]) {
      expect(run(`IMPORTING val TYPE i ${name} TYPE i`, `lcl=>meth( val = 1 ${name} = 2 ).`).length).to.equals(0, name);
      expect(run(`IMPORTING ${name} TYPE i val TYPE i`).length).to.equals(0, name);
      expect(run(`EXPORTING val TYPE i ${name} TYPE i`).length).to.equals(0, name);
    }
  });

  it("names that start with a keyword", () => {
    expect(run(`IMPORTING val TYPE i fallback TYPE i default_value TYPE i optional_flag TYPE i`).length).to.equals(0);
  });

  it("a structure component named default", () => {
    const code = `TYPES: BEGIN OF ty_s,
         optional TYPE string,
         default  TYPE string,
       END OF ty_s.`;
    expect(runMulti([{filename: "zfoo.prog.abap", contents: code}]).length).to.equals(0);
  });

});
