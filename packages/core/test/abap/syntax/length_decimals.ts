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
