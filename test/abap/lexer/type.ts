import {expect} from "chai";
import {MemoryFile} from "../../../src/files";
import Lexer from "../../../src/abap/lexer";
import * as Tokens from "../../../src/abap/tokens";

let tests = [
  {abap: "foo", type: Tokens.Identifier},
  {abap: "\"stsdf\"", type: Tokens.Comment},
  {abap: " 'stsdf'", type: Tokens.String},
  {abap: "##ASDF", type: Tokens.Pragma},
  {abap: "#foo", type: Tokens.Identifier},
];

describe("lexer types", () => {
  tests.forEach((test) => {
    let tokens = Lexer.run(new MemoryFile("foo.abap", test.abap));

    it("\"" + test.abap + "\" should be " + test.type["name"], () => {
      expect(tokens.length).to.equals(1);
      expect(tokens[0].constructor["name"]).to.equals(test.type["name"]);
    });
  });
});