import "../typings/index.d.ts";
import File from "../src/file";
import Lexer from "../src/lexer";
import * as chai from "chai";

let expect = chai.expect;

describe("count_tokens", () => {
  let tests = [
    {abap: "WRITE 'Hello'.",                      tokens: 3},
    {abap: "WRITE 'Hello world'.",                tokens: 3},
    {abap: "WRITE 'Hello ''big'' world'.",        tokens: 3},
    {abap: "WRITE 'Hello. world'.",               tokens: 3},
    {abap: "WRITE 'Hello, world'.",               tokens: 3},
    {abap: "WRITE 'Hello '' world'.",             tokens: 3},
    {abap: "WRITE: / 'Hello', 'world'.",          tokens: 7},
    {abap: "WRITE 'Hello'.\nWRITE 'World'.",      tokens: 6},
    {abap: "WRITE: 'Hello'.\nWRITE: 'World'.",    tokens: 8},
    {abap: "WRITE ' BLAH. '.",                    tokens: 3},
    {abap: "WRITE |foo,.:|.",                     tokens: 3},
    {abap: "WRITE `foo,.:`.",                     tokens: 3},
    {abap: "* this is a comment",                 tokens: 1},
    {abap: "\" this is a comment",                tokens: 1},
    {abap: "WRITE 'hello'. \" this is a comment", tokens: 4},
    {abap: "data foobar type abap_bool read-only value ABAP_FALSE ##NO_TEXT.", tokens: 11},
    {abap: "CALL METHOD (lv_class_name)=>jump.",  tokens: 8},
    {abap: "DATA(lv_foo) = 5.",                   tokens: 7},
    {abap: "zcl_class=>method( ).",               tokens: 6},
    {abap: "|fooobar|",                           tokens: 1},
    {abap: "|foo{ lv_foo }obar|",                 tokens: 1},
    {abap: "|foo{\n lv_foo }obar|",               tokens: 1},
    {abap: "foo-bar",                             tokens: 3},
    {abap: "foo( )-bar",                          tokens: 5},
    {abap: "foo( )",                              tokens: 3},
    {abap: "(foo)",                               tokens: 3},
    {abap: "foo( )->bar",                         tokens: 5},
    {abap: "foo( )->bar( )",                      tokens: 7},
  ];

  tests.forEach((test) => {
    let file = new File("foo.abap", test.abap);
    file.setTokens(Lexer.run(file));

    it("\"" + test.abap + "\" should have " + test.tokens + " tokens", () => {
      expect(file.getTokens().length).to.equals(test.tokens);
    });
  });
});