import {expect} from "chai";
import {StructureNode, StatementNode} from "../../../src/abap/nodes";
import * as Structures from "../../../src/abap/structures";
import * as Statements from "../../../src/abap/statements";

describe("Structure node", () => {

  it("findFirstStatement, found", () => {
    let top = new StructureNode(new Structures.ClassDefinition());
    top.addChild(new StatementNode(new Statements.ClassDefinition()));

    let found = top.findFirstStatement(Statements.ClassDefinition);

    expect(found).to.not.equal(undefined);
    expect(found.get()).to.be.instanceof(Statements.ClassDefinition);
  });

  it("findFirstStatement, not found", () => {
    let top = new StructureNode(new Structures.ClassDefinition());
    top.addChild(new StatementNode(new Statements.Do()));

    let found = top.findFirstStatement(Statements.ClassDefinition);

    expect(found).to.equal(undefined);
  });

});