import {expect} from "chai";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files/memory_file";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {Unknown} from "../../../src/abap/2_statements/statements/_statement";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Position} from "../../../src/position";
import {CharacterType, DateType, NumericType, PackedType, TimeType, UTCLongType} from "../../../src/abap/types/basic";

function inferredType(abap: string, name = "actual") {
  const filename = "zconvert.prog.abap";
  const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
  const obj = reg.getFirstObject() as ABAPObject;
  expect(obj.getABAPFiles()[0].getStatements().filter(s => s.get() instanceof Unknown)).to.have.length(0);
  const syntax = new SyntaxLogic(reg, obj).run();
  expect(syntax.issues.map(i => i.getMessage())).to.deep.equal([]);
  return syntax.spaghetti.lookupPosition(new Position(1, 1), filename)?.findVariable(name)?.getType();
}

describe("syntax, CONVERT inline targets", () => {
  it("a time zone source named inverted does not change a DATE target", () => {
    const type = inferredType(`DATA inverted TYPE c LENGTH 6.
DATA stamp TYPE p LENGTH 8 DECIMALS 0.
CONVERT TIME STAMP stamp TIME ZONE inverted INTO DATE DATA(actual).`);
    expect(type).to.be.instanceof(DateType);
  });

  it("a DATE target named saving does not change the following TIME target", () => {
    const type = inferredType(`DATA stamp TYPE p LENGTH 8 DECIMALS 0.
DATA saving TYPE d.
CONVERT TIME STAMP stamp TIME ZONE 'UTC' INTO DATE saving TIME DATA(actual).`);
    expect(type).to.be.instanceof(TimeType);
  });

  it("an inverted-date source is converted to a DATE target", () => {
    const type = inferredType(`DATA inverted TYPE n LENGTH 8.
CONVERT INVERTED-DATE inverted INTO DATE DATA(actual).`);
    expect(type).to.be.instanceof(DateType);
  });

  it("INTO INVERTED-DATE infers numeric text of length 8", () => {
    const type = inferredType(`DATA date TYPE d.
CONVERT DATE date INTO INVERTED-DATE DATA(actual).`);
    expect(type).to.be.instanceof(NumericType);
    expect((type as NumericType).getLength()).to.equal(8);
  });

  it("DAYLIGHT SAVING TIME infers a character of length 1", () => {
    const type = inferredType(`DATA stamp TYPE p LENGTH 8 DECIMALS 0.
CONVERT TIME STAMP stamp TIME ZONE 'UTC' INTO DATE DATA(date) TIME DATA(time)
  DAYLIGHT SAVING TIME DATA(actual).`);
    expect(type).to.be.instanceof(CharacterType);
    expect((type as CharacterType).getLength()).to.equal(1);
  });

  it("INTO TIME STAMP infers a short timestamp", () => {
    const type = inferredType(`DATA date TYPE d.
DATA time TYPE t.
CONVERT DATE date TIME time TIME ZONE 'UTC' INTO TIME STAMP DATA(actual).`);
    expect(type).to.be.instanceof(PackedType);
    expect((type as PackedType).getLength()).to.equal(8);
    expect((type as PackedType).getDecimals()).to.equal(0);
  });

  it("INTO UTCLONG infers a long timestamp", () => {
    const type = inferredType(`DATA date TYPE d.
DATA time TYPE t.
CONVERT DATE date TIME time TIME ZONE 'UTC' INTO UTCLONG DATA(actual).`);
    expect(type).to.be.instanceof(UTCLongType);
  });
});
