import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {Class} from "../../../src/objects";
import {getABAPObjects} from "../../get_abap";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {MemoryFile} from "../../../src/files/memory_file";
import * as Basic from "../../../src/abap/types/basic";
import {AbstractType} from "../../../src/abap/types/basic/_abstract_type";

// the type of the first importing parameter of method "name" in a class "cl"
function importingType(definition: string): AbstractType | undefined {
  const abap = `CLASS cl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_numc TYPE n LENGTH 5.
    ${definition}
ENDCLASS.
CLASS cl IMPLEMENTATION.
  METHOD name.
  ENDMETHOD.
ENDCLASS.`;
  const reg = new Registry().addFile(new MemoryFile("cl.clas.abap", abap)).parse();
  const clas = getABAPObjects(reg)[0] as Class;
  const scope = new SyntaxLogic(reg, clas).run().spaghetti.getTop().getFirstChild();
  const def = scope?.findClassDefinition(clas.getName())?.getMethodDefinitions().getByName("name");
  return def?.getParameters().getImporting()[0]?.getType();
}

function syntaxIssues(abap: string): string[] {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  return reg.findIssues().filter(i => i.getKey() === "check_syntax").map(i => i.getMessage());
}

describe("Types, generic n", () => {

  it("method parameter TYPE n is generic", () => {
    const type = importingType("METHODS name IMPORTING digits TYPE n.");
    expect(type).to.be.instanceof(Basic.NGenericType);
    expect(type!.isGeneric()).to.equal(true);
  });

  it("generic n is still a NumericType", () => {
    const type = importingType("METHODS name IMPORTING digits TYPE n.");
    expect(type).to.be.instanceof(Basic.NumericType);
    expect((type as Basic.NumericType).getLength()).to.equal(1);
  });

  it("OPTIONAL and DEFAULT keep it generic", () => {
    expect(importingType("METHODS name IMPORTING digits TYPE n OPTIONAL.")).to.be.instanceof(Basic.NGenericType);
    expect(importingType("METHODS name IMPORTING digits TYPE n DEFAULT '1'.")).to.be.instanceof(Basic.NGenericType);
  });

  it("a parameter typed with a numeric text type is not generic", () => {
    const type = importingType("METHODS name IMPORTING digits TYPE ty_numc.");
    expect(type).to.be.instanceof(Basic.NumericType);
    expect(type).to.not.be.instanceof(Basic.NGenericType);
    expect(type!.isGeneric()).to.equal(false);
    expect((type as Basic.NumericType).getLength()).to.equal(5);
  });

  it("the other generic types are unchanged", () => {
    expect(importingType("METHODS name IMPORTING val TYPE c.")).to.be.instanceof(Basic.CGenericType);
    expect(importingType("METHODS name IMPORTING val TYPE x.")).to.be.instanceof(Basic.XGenericType);
    expect(importingType("METHODS name IMPORTING val TYPE p.")).to.be.instanceof(Basic.PGenericType);
    expect(importingType("METHODS name IMPORTING val TYPE numeric.")).to.be.instanceof(Basic.NumericGenericType);
  });

  it("a variable declared TYPE n is not generic", () => {
    const abap = `DATA digits TYPE n.`;
    const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
    const obj = getABAPObjects(reg)[0];
    const found = new SyntaxLogic(reg, obj).run().spaghetti.getTop().getFirstChild()?.getFirstChild()?.findVariable("digits");
    expect(found?.getType()).to.be.instanceof(Basic.NumericType);
    expect(found?.getType()).to.not.be.instanceof(Basic.NGenericType);
  });

  it("calls with numeric texts of any length are accepted", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS pad
      IMPORTING digits        TYPE n
      RETURNING VALUE(result) TYPE string.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD pad.
    DATA copy TYPE n LENGTH 10.
    copy = digits.
    IF digits = '0000004711' OR digits IS INITIAL.
      result = digits.
    ENDIF.
    result = |{ copy }{ digits }|.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  DATA long TYPE n LENGTH 10.
  DATA short TYPE n LENGTH 2.
  lcl=>pad( long ).
  lcl=>pad( short ).
  lcl=>pad( '4711' ).`;
    expect(syntaxIssues(abap)).to.deep.equal([]);
  });

  it("FORM parameter TYPE n is accepted with any length", () => {
    const abap = `
FORM pad USING digits TYPE n.
  WRITE digits.
ENDFORM.

START-OF-SELECTION.
  DATA long TYPE n LENGTH 10.
  PERFORM pad USING long.`;
    expect(syntaxIssues(abap)).to.deep.equal([]);
  });

});
