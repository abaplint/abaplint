import {expect} from "chai";
import {Lexer} from "../../../src/abap/1_lexer/lexer";
import * as Tokens from "../../../src/abap/1_lexer/tokens";
import {MemoryFile} from "../../../src/files/memory_file";

const tests = [
  {abap: "foo", type: Tokens.Identifier},
  {abap: "\"stsdf\"", type: Tokens.Comment},
  {abap: " 'stsdf'", type: Tokens.String},
  {abap: "|bar|", type: Tokens.StringTemplate},
  {abap: "|bar{", type: Tokens.StringTemplateBegin},
  {abap: "}bar|", type: Tokens.StringTemplateEnd},
  {abap: "}bar{", type: Tokens.StringTemplateMiddle},
  {abap: "##ASDF", type: Tokens.Pragma},
  {abap: "#foo", type: Tokens.Identifier},
];

describe("lexer types", () => {
  tests.forEach((test) => {
    it("\"" + test.abap + "\" should be " + test.type["name"], () => {
      const tokens = Lexer.run(new MemoryFile("foo.abap", test.abap)).tokens;
      expect(tokens.length).to.equals(1);
      expect(tokens[0].constructor["name"]).to.equals(test.type["name"]);
    });
  });
});