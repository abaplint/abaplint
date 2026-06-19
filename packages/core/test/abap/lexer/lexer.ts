import {expect} from "chai";
import {Identifier, AssociationName, StringTemplateBegin, StringTemplateEnd, WInstanceArrow} from "../../../src/abap/1_lexer/tokens";
import {getTokens} from "../_utils";

describe("lexer", () => {

  it("arrow whitespace", () => {
    const tokens = getTokens(") ->text");
    expect(tokens.length).to.equal(3);
    expect(tokens[1]).to.be.instanceof(WInstanceArrow);
  });

  it("only one token, test it doesnt crash", () => {
    const tokens = getTokens(".");
    expect(tokens.length).to.equal(1);
  });

  it("two tokens", () => {
    const tokens = getTokens('`foo` "#EC NOTEXT');
    expect(tokens.length).to.equal(2);
  });

  it("two tokens, no space", () => {
    const tokens = getTokens('`foo`"#EC NOTEXT');
    expect(tokens.length).to.equal(2);
  });

  it("string template", () => {
    const tokens = getTokens("|{ sdf }|");
    expect(tokens.length).to.equal(3);
    expect(tokens[0]).to.be.instanceof(StringTemplateBegin);
    expect(tokens[2]).to.be.instanceof(StringTemplateEnd);
  });

  it("string template", () => {
    const tokens = getTokens("|{ sdf }sdf|");
    expect(tokens.length).to.equal(3);
    expect(tokens[0]).to.be.instanceof(StringTemplateBegin);
    expect(tokens[2]).to.be.instanceof(StringTemplateEnd);
  });

  it("string template, error", () => {
    const tokens = getTokens("|{sdf }|");
    expect(tokens.length).to.equal(3);
    expect(tokens[0]).to.not.be.instanceof(StringTemplateBegin);
  });

  it("string template, error 2", () => {
    const tokens = getTokens("|{ sdf}|");
    expect(tokens.length).to.equal(3);
    expect(tokens[2]).to.not.be.instanceof(StringTemplateEnd);
  });

  it("two comments, same column", () => {
    const tokens = getTokens(`
 " hello
 " world`);
    expect(tokens.length).to.equal(2);
    expect(tokens[0].getCol()).to.equal(tokens[1].getCol(), "comments should be in same column");
  });

  it("AssociationName: no space before backslash", () => {
    const tokens = getTokens("tab\\_assoc");
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.be.instanceof(Identifier);
    expect(tokens[1]).to.be.instanceof(AssociationName);
    expect(tokens[1].getStr()).to.equal("\\_assoc");
  });

  it("AssociationName: multi-hop no space", () => {
    const tokens = getTokens("tab\\_assoc1\\_assoc2");
    expect(tokens.length).to.equal(3);
    expect(tokens[1]).to.be.instanceof(AssociationName);
    expect(tokens[2]).to.be.instanceof(AssociationName);
  });

  it("AssociationName: space before backslash emits Identifier, not AssociationName", () => {
    const tokens = getTokens("tab \\_assoc");
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.be.instanceof(Identifier);
    expect(tokens[1]).to.be.instanceof(Identifier);
    expect(tokens[1]).to.not.be.instanceof(AssociationName);
  });

  it("AssociationName: after tilde no space", () => {
    const tokens = getTokens("t1~\\_assoc");
    expect(tokens.length).to.equal(2);
    expect(tokens[0]).to.be.instanceof(Identifier);
    expect(tokens[0].getStr()).to.equal("t1~");
    expect(tokens[1]).to.be.instanceof(AssociationName);
  });

  it("AssociationName: backslash inside string template is Identifier", () => {
    const tokens = getTokens("|{ \\_var }|");
    expect(tokens.length).to.equal(3);
    expect(tokens[0]).to.be.instanceof(StringTemplateBegin);
    expect(tokens[1]).to.not.be.instanceof(AssociationName);
  });

});