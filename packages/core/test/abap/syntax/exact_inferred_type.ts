import {expect} from "chai";
import {runProgram} from "./syntax";
import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {SyntaxLogic} from "../../../src/abap/5_syntax/syntax";
import {Position} from "../../../src/position";

const declarations = `
DATA i TYPE i.
DATA p TYPE p LENGTH 8 DECIMALS 2.
DATA c TYPE c LENGTH 4.
DATA s TYPE string.
`;

function typeOf(code: string, name: string): string | undefined {
  const filename = "zfoobar.prog.abap";
  const reg = new Registry().addFile(new MemoryFile(filename, declarations + code)).parse();
  const obj = reg.getFirstObject() as ABAPObject;
  const scope = new SyntaxLogic(reg, obj).run().spaghetti.lookupPosition(new Position(1, 1), filename);
  return scope?.findVariable(name)?.getType().toABAP();
}

describe("syntax.ts, EXACT # without a target type", () => {
  const types: {code: string, type: string}[] = [
    {code: `EXACT #( p )`, type: "p LENGTH 8 DECIMALS 2"},
    {code: `EXACT #( c )`, type: "c LENGTH 4"},
    {code: `EXACT #( i ) + 1`, type: "i"},
  ];

  for (const t of types) {
    it(`DATA(y) = ${t.code} is ${t.type}`, () => {
      const code = `DATA(y) = ${t.code}.`;
      expect(runProgram(declarations + code).length).to.equal(0);
      expect(typeOf(code, "y")).to.equal(t.type);
    });
  }

  const valid = [
    `i = i + EXACT #( p ).`,
    `IF EXACT #( p ) = 1. ENDIF.`,
    `IF i = EXACT #( p ). ENDIF.`,
    `s = |{ EXACT #( p ) }|.`,
    `s = s && EXACT #( c ).`,
    `CASE EXACT #( i ). WHEN 1. ENDCASE.`,
    `i = abs( EXACT #( p ) ).`,
    `i = strlen( EXACT #( c ) ).`,
  ];

  for (const code of valid) {
    it(`ok, ${code}`, () => {
      expect(runProgram(declarations + code).length).to.equal(0);
    });
  }

  it("error, unknown argument", () => {
    const issues = runProgram(declarations + `i = i + EXACT #( nonexisting ).`);
    expect(issues[0]?.getMessage()).to.contain(`"nonexisting" not found`);
  });
});
