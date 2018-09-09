import {File} from "../../src/file";
import Lexer from "../../src/lexer";
import Runner from "../../src/runner";
import * as chai from "chai";

let expect = chai.expect;

describe("count_tokens", () => {
  let tests = [
    {abap: "WRITE 'Hello'.",                      tokens: 3},
    {abap: "* com\n* ano",                        tokens: 2},
    {abap: "WRITE\n'Hello'.",                     tokens: 3},
    {abap: "WRITE\t'Hello'.",                     tokens: 3},
    {abap: "WRITE 'Hello world'.",                tokens: 3},
    {abap: "WRITE 'Hello ''big'' world'.",        tokens: 3},
    {abap: "WRITE 'Hello. world'.",               tokens: 3},
    {abap: "WRITE 'Hello, world'.",               tokens: 3},
    {abap: "WRITE: / 'Hello', 'world'.",          tokens: 7},
    {abap: "WRITE 'Hello'.\nWRITE 'World'.",      tokens: 6},
    {abap: "WRITE 'Hello'.WRITE 'World'.",        tokens: 6},
    {abap: "WRITE: 'Hello'.\nWRITE: 'World'.",    tokens: 8},
    {abap: "WRITE ' BLAH. '.",                    tokens: 3},
    {abap: "WRITE\nBAR",                          tokens: 2},
    {abap: "WRITE |foo,.:|.",                     tokens: 3},
    {abap: "WRITE `foo,.:`.",                     tokens: 3},
    {abap: "* this is a comment",                 tokens: 1},
    {abap: "\" this is a comment",                tokens: 1},
    {abap: "WRITE 'hello'. \" this is a comment", tokens: 4},
    {abap: "data read-only value ##NO_TEXT.",     tokens: 7},
    {abap: "CALL METHOD (lv_class_name)=>jump.",  tokens: 8},
    {abap: "foo=>jump( ).",                       tokens: 6},
    {abap: "foo->jump( ).",                       tokens: 6},
    {abap: "DATA(lv_foo) = 5.",                   tokens: 7},
    {abap: "zcl_class=>method( ).",               tokens: 6},
    {abap: "|fooobar|",                           tokens: 1},
    {abap: "|foo{ lv_foo }obar|",                 tokens: 1},
    {abap: "|foo \\| bar|",                       tokens: 1},
    {abap: "|foo{\n lv_foo }obar|",               tokens: 1},
    {abap: "foo-bar",                             tokens: 3},
    {abap: "foo( )-bar",                          tokens: 5},
    {abap: "foo( )",                              tokens: 3},
    {abap: "(foo)",                               tokens: 3},
    {abap: "foo( )->bar",                         tokens: 5},
    {abap: "foo( )->bar( )",                      tokens: 7},
    {abap: "ASSIGN ('(SSIFP)TTAB') TO <lg_any>.", tokens: 7},
    {abap: "IF NOT it_tpool[] IS INITIAL.",       tokens: 8},
    {abap: "WRITE lv_value+2.",                   tokens: 5},
    {abap: "WRITE: foo, bar.",                    tokens: 6},
    {abap: "WRITE foo.\n\nWRITE bar.",            tokens: 6},
    {abap: "WRITE:/ 'foobar:'.",                  tokens: 5},
    {abap: "WRITE 'Hello '' world'.",             tokens: 3},
    {abap: "set_cdata( '' ).",                    tokens: 5},
    {abap: "set_cdata( '''' ).",                  tokens: 5},
    {abap: "set_cdata( '''hello''' ).",           tokens: 5},
    {abap: "COUNT(*)",                            tokens: 4},
    {abap: "INCLUDE <OBJECT>.",                   tokens: 3},
    {abap: "'foo'\"-> comment",                   tokens: 2},
    {abap: "'/SAP/PUBLIC/zgit/' 'script.js'",     tokens: 2},
    {abap: "2\" comment",                         tokens: 2},
    {abap: "'foo'\" comment",                     tokens: 2},
    {abap: "foo: bar, moo.",                      tokens: 6},
    {abap: "`''`",                                tokens: 1},
    {abap: "`bar`",                               tokens: 1},
    {abap: "(foo@)",                              tokens: 3},
    {abap: "INTO @DATA(node_key)",                tokens: 6},
    {abap: "@DATA(node_key)",                     tokens: 5},
    {abap: "WRITE |sdf|",                         tokens: 2},
    {abap: "WRITE |sd\\{f|",                      tokens: 2},
    {abap: "WRITE |sd\\{f\\}|",                   tokens: 2},
    {abap: "WRITE |sd\"f|",                       tokens: 2},
    {abap: "WRITE |sd'f|",                        tokens: 2},
    {abap: "WRITE |sd`f|",                        tokens: 2},
    {abap: "WRITE ` | `",                         tokens: 2},
    {abap: "WRITE |{ 'blah' }|",                  tokens: 2},
    {abap: "WRITE |{ '|' }|",                     tokens: 2},
    {abap: "WRITE |{ |sdf| }|",                   tokens: 2},
    {abap: "WRITE |{ |{ |{ lv_bar }| }| }|",      tokens: 2},
    {abap: "FOO ##SELECT_FAE_WITH_LOB[ASDF].",    tokens: 3},
    {abap: "FOO ##SELECT_FAE_WITH_LOB[ASDF]",     tokens: 2},
//    {abap: "WRITE `a``b`",                        tokens: 2},
//    {abap: "WRITE `\"foo``\"bar`",                tokens: 2},
  ];

  tests.forEach((test) => {
    let file = new File("foo.abap", test.abap);
    let tokens = Lexer.run(file);

    it("\"" + test.abap + "\" should have " + test.tokens + " tokens", () => {
      expect(tokens.length).to.equals(test.tokens);
    });

    it("\"" + test.abap + "\" should match parsed file token count", () => {
      expect(tokens.length).to.equals(Runner.parse([file])[0].getTokens().length);
    });
  });
});