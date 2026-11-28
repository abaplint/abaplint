import {expect} from "chai";
import {StatementNode} from "../../../src/abap/nodes";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files/memory_file";
import {ABAPObject} from "../../../src/objects/_abap_object";
import {ABAPFile} from "../../../src/abap/abap_file";
import {EditHelper} from "../../../src/edit_helper";
import {VirtualPosition} from "../../../src/virtual_position";
import {MacroCall} from "../../../src/abap/2_statements/statements/_statement";

function parse(abap: string): ABAPFile {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  return (reg.getFirstObject() as ABAPObject).getMainABAPFile()!;
}

describe("Statement node, includesToken", () => {

  it("chained statements, a token belongs to its own statement only", () => {
    const file = parse(`DATA: foo TYPE i,
      bar TYPE i.`);
    const [first, second] = file.getStatements();
    const bar = second.getTokens().find(t => t.getStr() === "bar")!;
    expect(first.includesToken(bar)).to.equal(false);
    expect(second.includesToken(bar)).to.equal(true);
    // the DATA keyword is shared by both statements of the chain
    const data = second.getFirstToken();
    expect(first.includesToken(data)).to.equal(true);
    expect(second.includesToken(data)).to.equal(true);
  });

  it("token of another statement", () => {
    const file = parse(`WRITE 'a'.
WRITE 'b'.
WRITE 'c'.`);
    const [first, second, third] = file.getStatements();
    for (const t of first.getTokens()) {
      expect(second.includesToken(t)).to.equal(false);
      expect(third.includesToken(t)).to.equal(false);
    }
    for (const t of third.getTokens()) {
      expect(first.includesToken(t)).to.equal(false);
      expect(third.includesToken(t)).to.equal(true);
    }
  });

  it("statement without children", () => {
    const file = parse(`WRITE 'a'.`);
    const empty = new StatementNode(new Statements.Write());
    expect(empty.includesToken(file.getStatements()[0].getFirstToken())).to.equal(false);
  });

  it("macro called twice, a token of the second expansion is found at the second call", () => {
    const file = parse(`DEFINE _set.
  &1 = &2.
END-OF-DEFINITION.
DATA foo TYPE i.
_set foo 1.
_set foo 2.`);
    const statements = file.getStatements();
    const calls = statements.filter(s => s.get() instanceof MacroCall);
    expect(calls.length).to.equal(2);
    const expanded = statements.filter(s => s.get() instanceof Statements.Move);
    expect(expanded.length).to.equal(2);
    const token = expanded[1].getFirstToken();
    expect(token.getStart()).to.be.instanceof(VirtualPosition);

    const found = EditHelper.findStatement(token, file);
    expect(found).to.equal(calls[1]);

    // the expansions have the same positions inside the macro, only the call positions differ
    expect(expanded[0].includesToken(expanded[1].getFirstToken())).to.equal(false);
    expect(expanded[1].includesToken(expanded[0].getFirstToken())).to.equal(false);
  });

});
