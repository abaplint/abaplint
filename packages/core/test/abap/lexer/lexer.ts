import {expect} from "chai";
import {WInstanceArrow} from "../../../src/abap/1_lexer/tokens";
import {getTokens} from "../_utils";

describe("lexer", () => {

  it.skip("arrow whitespace", () => {
    const tokens = getTokens(") ->text");
    expect(tokens.length).to.equal(3);
    console.dir(tokens[1]);
    expect(tokens[1]).to.be.instanceof(WInstanceArrow);
  });

});