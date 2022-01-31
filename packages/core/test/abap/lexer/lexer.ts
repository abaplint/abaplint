import {expect} from "chai";
import {WInstanceArrow} from "../../../src/abap/1_lexer/tokens";
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

});