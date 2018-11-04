import * as Structures from "../../src/abap/structures/";
import * as Statements from "../../src/abap/statements/";
import {expect} from "chai";
import {parse} from "../utils";

describe("Structure, test generated nodes", function() {
  it("Test 01", function () {
    const result = new Structures.Else().runFile(parse("ELSE."));
    expect(result.issues.length).to.equal(0);
    expect(result.node).to.not.equal(undefined);
    expect(result.node).to.be.instanceof(Structures.Else);
    expect(result.node.getChildren().length).to.equal(1);
    expect(result.node.getChildren()[0]).to.be.instanceof(Statements.Else);
  });

  it("Test 02", function () {
    const result = new Structures.Else().runFile(parse("ELSE. moo = boo."));
    expect(result.node).to.be.instanceof(Structures.Else);
    expect(result.node.getChildren().length).to.equal(2);
    expect(result.node.getChildren()[0]).to.be.instanceof(Statements.Else);
    expect(result.node.getChildren()[1]).to.be.instanceof(Structures.Body);
    expect(result.node.getChildren()[1].getChildren().length).to.equal(1);
  });

  it("Test 03", function () {
    const result = new Structures.Else().runFile(parse("ELSE. moo = boo. loo = foo."));
    expect(result.node).to.be.instanceof(Structures.Else);
    expect(result.node.getChildren().length).to.equal(2);
    expect(result.node.getChildren()[0]).to.be.instanceof(Statements.Else);
    expect(result.node.getChildren()[1]).to.be.instanceof(Structures.Body);
    expect(result.node.getChildren()[1].getChildren().length).to.equal(2);
  });
});