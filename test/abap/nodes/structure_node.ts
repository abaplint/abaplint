import {expect} from "chai";
import {StructureNode, StatementNode} from "../../../src/abap/nodes";
import * as Structures from "../../../src/abap/structures";
import * as Statements from "../../../src/abap/statements";

describe("Structure node", () => {

  it("findFirstStatement, found", () => {
    const top = new StructureNode(new Structures.ClassDefinition());
    top.addChild(new StatementNode(new Statements.ClassDefinition()));

    const found = top.findFirstStatement(Statements.ClassDefinition);

    expect(found).to.not.equal(undefined);
    if (found) {
      expect(found.get()).to.be.instanceof(Statements.ClassDefinition);
    }
  });

  it("findFirstStatement, not found", () => {
    const top = new StructureNode(new Structures.ClassDefinition());
    top.addChild(new StatementNode(new Statements.Do()));

    const found = top.findFirstStatement(Statements.ClassDefinition);

    expect(found).to.equal(undefined);
  });

});