import * as Structures from "../../src/abap/structures/";
import * as Statements from "../../src/abap/statements/";
import {expect} from "chai";
import {parse} from "./_utils";
import {StructureParser} from "../../src/abap/structure_parser";

describe("Structure, test generated nodes", function() {
  it("Test 01", function () {
    const result = StructureParser.runFile(new Structures.Else(), parse("ELSE."));
    expect(result.issues.length).to.equal(0);
    expect(result.node).to.not.equal(undefined);
    if (result.node) {
      expect(result.node.get()).to.be.instanceof(Structures.Else);
      expect(result.node.getChildren().length).to.equal(1);
      expect(result.node.getChildren()[0].get()).to.be.instanceof(Statements.Else);
    }
  });

  it("Test 02", function () {
    const result = StructureParser.runFile(new Structures.Else(), parse("ELSE. moo = boo."));
    expect(result.node).to.not.equal(undefined);
    if (result.node) {
      expect(result.node.get()).to.be.instanceof(Structures.Else);
      expect(result.node.getChildren().length).to.equal(2);
      expect(result.node.getChildren()[0].get()).to.be.instanceof(Statements.Else);
      expect(result.node.getChildren()[1].get()).to.be.instanceof(Structures.Body);
      expect(result.node.getChildren()[1].getChildren().length).to.equal(1);
    }
  });

  it("Test 03", function () {
    const result = StructureParser.runFile(new Structures.Else(), parse("ELSE. moo = boo. loo = foo."));
    expect(result.node).to.not.equal(undefined);
    if (result.node) {
      expect(result.node.get()).to.be.instanceof(Structures.Else);
      expect(result.node.getChildren().length).to.equal(2);
      expect(result.node.getChildren()[0].get()).to.be.instanceof(Statements.Else);
      expect(result.node.getChildren()[1].get()).to.be.instanceof(Structures.Body);
      expect(result.node.getChildren()[1].getChildren().length).to.equal(2);
    }
  });

  it("Test 04", function () {
    const result = StructureParser.runFile(new Structures.If(), parse("IF foo = boo. ENDIF."));
    expect(result.node).to.not.equal(undefined);
    if (result.node) {
      expect(result.node.get()).to.be.instanceof(Structures.If);
      expect(result.node.getChildren().length).to.equal(2);
      expect(result.node.getChildren()[0].get()).to.be.instanceof(Statements.If);
      expect(result.node.getChildren()[1].get()).to.be.instanceof(Statements.EndIf);
    }
  });

  it("Test 05", function () {
    const result = StructureParser.runFile(new Structures.If(), parse("IF foo = boo. moo = boo. ENDIF."));
    expect(result.node).to.not.equal(undefined);
    if (result.node) {
      expect(result.node.get()).to.be.instanceof(Structures.If);
      expect(result.node.getChildren().length).to.equal(3);
    }
  });

  it("Test 06", function () {
    const result = StructureParser.runFile(new Structures.Any(), parse("moo = boo. loo = foo."));
    expect(result.node).to.not.equal(undefined);
    if (result.node) {
      expect(result.node.get()).to.be.instanceof(Structures.Any);
      expect(result.node.getChildren().length).to.equal(2);
      const count = result.node.getChildren()[0].getChildren().length + result.node.getChildren()[1].getChildren().length;
      expect(count).to.equal(2);
    }
  });
});