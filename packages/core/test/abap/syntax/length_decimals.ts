import {expect} from "chai";
import {runProgram} from "./syntax";
import {Registry} from "../../../src/registry";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {MemoryFile} from "../../../src/files/memory_file";
import {CharacterType} from "../../../src/abap/types/basic";
import {getABAPObjects} from "../../get_abap";

const errors = (abap: string): string | undefined => runProgram(abap)[0]?.getMessage();

const lengthMessage = "\"LENGTH\" can only be specified for types C, N, X, or P";
const decimalsMessage = "\"DECIMALS\" can be specified only for type P";

describe("syntax.ts, LENGTH and DECIMALS additions", () => {

  it("error, issue #1988, TYPE d LENGTH DECIMALS", () => {
    expect(errors(`DATA tsl TYPE d LENGTH 21 DECIMALS 7.`)).to.equal(lengthMessage);
  });

  it("error, TYPE d LENGTH 8, also its own length", () => {
    expect(errors(`DATA tsl TYPE d LENGTH 8.`)).to.equal(lengthMessage);
  });

  it("error, TYPE string LENGTH", () => {
    expect(errors(`DATA s TYPE string LENGTH 5.`)).to.equal(lengthMessage);
  });

  it("error, TYPE i DECIMALS", () => {
    expect(errors(`DATA s TYPE i DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, TYPE c LENGTH DECIMALS", () => {
    expect(errors(`DATA s TYPE c LENGTH 10 DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, TYPE x LENGTH DECIMALS", () => {
    expect(errors(`DATA s TYPE x LENGTH 4 DECIMALS 1.`)).to.equal(decimalsMessage);
  });

  it("error, LENGTH without TYPE", () => {
    expect(errors(`DATA s LENGTH 5.`)).to.equal(lengthMessage);
  });

  it("error, DECIMALS without TYPE", () => {
    expect(errors(`DATA s DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, a named type cannot be given a length, even a character-like one", () => {
    expect(errors(`TYPES ty TYPE c LENGTH 5.
TYPES bar TYPE ty LENGTH 3.`)).to.equal(lengthMessage);
  });

  it("error, a named type cannot be given decimals", () => {
    expect(errors(`TYPES ty TYPE c LENGTH 5.
TYPES bar TYPE ty DECIMALS 2.`)).to.equal(decimalsMessage);
  });

  it("error, CONSTANTS", () => {
    expect(errors(`CONSTANTS k TYPE d LENGTH 8 VALUE '20200101'.`)).to.equal(lengthMessage);
  });

  it("error, STATICS", () => {
    expect(errors(`FORM f.
  STATICS st TYPE n LENGTH 4 DECIMALS 1.
ENDFORM.`)).to.equal(decimalsMessage);
  });

  it("error, CLASS-DATA", () => {
    expect(errors(`CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-DATA cd TYPE t LENGTH 6.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.`)).to.equal(lengthMessage);
  });

  it("error, structure component", () => {
    expect(errors(`TYPES: BEGIN OF ts,
         a TYPE t LENGTH 6,
       END OF ts.`)).to.equal(lengthMessage);
  });

  it("ok, LENGTH with c, n, x and p, DECIMALS with p", () => {
    expect(errors(`DATA a TYPE p LENGTH 8 DECIMALS 2.
DATA b TYPE p DECIMALS 2.
DATA c1 TYPE c LENGTH 5.
DATA n1 TYPE n LENGTH 5.
DATA x1 TYPE x LENGTH 5.
DATA p2 TYPE p VALUE 3 DECIMALS 0 LENGTH 4.
CONSTANTS k TYPE x LENGTH 2 VALUE 'FFFF'.
TYPES ty TYPE p LENGTH 16 DECIMALS 14.
FORM f.
  STATICS st TYPE n LENGTH 4.
ENDFORM.
TYPES: BEGIN OF ts,
         a TYPE p LENGTH 4 DECIMALS 1,
         b TYPE c LENGTH 3,
       END OF ts.`)).to.equal(undefined);
  });

  it("ok, LIKE with LENGTH, ignored by a system, any type", () => {
    expect(errors(`DATA c1 TYPE c LENGTH 5.
DATA c2 LIKE c1 LENGTH 3.
DATA d1 TYPE d.
DATA d2 LIKE d1 LENGTH 3.
DATA s1 TYPE string.
DATA s2 LIKE s1 LENGTH 3.
DATA p1 TYPE p LENGTH 8 DECIMALS 2.
DATA p2 LIKE p1 LENGTH 4.`)).to.equal(undefined);
  });

  it("ok, LIKE with LENGTH keeps the length of the referenced field", () => {
    const abap = `DATA c1 TYPE c LENGTH 5.
DATA c2 LIKE c1 LENGTH 3.`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
    const spaghetti = new SyntaxLogic(reg, getABAPObjects(reg)[0]).run().spaghetti;
    // builtin, global, program
    const type = spaghetti.getTop().getFirstChild()?.getFirstChild()?.findVariable("c2")?.getType();
    expect(type).to.be.instanceof(CharacterType);
    expect((type as CharacterType).getLength()).to.equal(5);
  });

  describe("LIKE with DECIMALS", () => {
    const likeMessage = "When referencing another field (with LIKE), type and length cannot be changed";

    it("error, type p, also with the same decimals", () => {
      expect(errors(`DATA p1 TYPE p LENGTH 8 DECIMALS 2.
DATA p2 LIKE p1 DECIMALS 2.`)).to.equal(likeMessage);
    });

    it("error, type c", () => {
      expect(errors(`DATA c1 TYPE c LENGTH 5.
DATA c2 LIKE c1 DECIMALS 2.`)).to.equal(likeMessage);
    });

    it("error, type i, with LENGTH", () => {
      expect(errors(`DATA i1 TYPE i.
DATA i2 LIKE i1 LENGTH 3 DECIMALS 2.`)).to.equal(likeMessage);
    });

    it("error, LIKE LINE OF", () => {
      expect(errors(`DATA itab TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA l1 LIKE LINE OF itab DECIMALS 2.`)).to.equal(likeMessage);
    });

    it("error, LIKE REF TO", () => {
      expect(errors(`DATA p1 TYPE p.
DATA r1 LIKE REF TO p1 DECIMALS 2.`)).to.equal(likeMessage);
    });
  });

});

describe("syntax.ts, length in brackets, #4613", () => {
  const ignored = (type: string) => "Lengths specified in combination with type \"" + type + "\" are ignored";
  const own = (type: string, length: number) =>
    "Type \"" + type + "\" can only have the specified length \"" + length + "\" or no length specified at all";
  const inClass = (declaration: string) => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS m.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD m.
    ${declaration}
  ENDMETHOD.
ENDCLASS.`;

  it("error, d, t and f with another length than their own", () => {
    expect(errors(`DATA foo(4) TYPE d.`)).to.equal(own("D", 8));
    expect(errors(`DATA foo(8) TYPE t.`)).to.equal(own("T", 6));
    expect(errors(`DATA foo(4) TYPE f.`)).to.equal(own("F", 8));
  });

  it("error, d with a constant length", () => {
    expect(errors(`CONSTANTS len TYPE i VALUE 4.
DATA foo(len) TYPE d.`)).to.equal(own("D", 8));
  });

  it("error, string, xstring, int8, decfloat34 and utclong", () => {
    for (const type of ["string", "xstring", "int8", "decfloat34", "utclong"]) {
      expect(errors(`DATA foo(8) TYPE ${type}.`), type).to.equal(ignored(type.toUpperCase()));
    }
  });

  it("error, type defined in the program", () => {
    expect(errors(`TYPES ty TYPE c LENGTH 3.
DATA foo(5) TYPE ty.`)).to.equal(ignored("TY"));
  });

  it("error, TYPES, CONSTANTS and structure component", () => {
    expect(errors(`TYPES ty(8) TYPE string.`)).to.equal(ignored("STRING"));
    expect(errors(`CONSTANTS co(4) TYPE d VALUE '20260101'.`)).to.equal(own("D", 8));
    expect(errors(`DATA: BEGIN OF s,
        comp(8) TYPE string,
      END OF s.`)).to.equal(ignored("STRING"));
  });

  it("error, LIKE", () => {
    expect(errors(`DATA base TYPE c LENGTH 10.
DATA foo(5) LIKE base.`)).to.equal("When referencing another field (with LIKE), type and length cannot be changed");
  });

  it("ok outside classes, d, t and f with their own length and i with any length, a warning on the system", () => {
    expect(errors(`DATA d8(8) TYPE d.
DATA t6(6) TYPE t.
DATA f8(8) TYPE f.
DATA i1(1) TYPE i.
DATA i16(16) TYPE i.
TYPES tyd(8) TYPE d.
FORM f.
  DATA fi8(8) TYPE i.
ENDFORM.`)).to.equal(undefined);
  });

  it("error in classes, d with its own length and i", () => {
    expect(errors(inClass(`DATA loc(8) TYPE d.`))).to.equal(ignored("D"));
    expect(errors(inClass(`DATA loc(8) TYPE i.`))).to.equal(ignored("I"));
    expect(errors(`
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA attr(8) TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.`)).to.equal(ignored("I"));
  });

  it("ok, c, n, x and p, and no type", () => {
    expect(errors(`DATA c1(5) TYPE c.
DATA n1(5) TYPE n.
DATA x1(5) TYPE x.
DATA p1(8) TYPE p DECIMALS 2.
DATA p3(3) TYPE p.
DATA c2(5).
TYPES ty2(4) TYPE c.
CONSTANTS co(3) TYPE c VALUE 'abc'.`)).to.equal(undefined);
    expect(errors(inClass(`DATA loc(5) TYPE c.`))).to.equal(undefined);
  });
});
