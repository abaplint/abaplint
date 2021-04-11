import {expect} from "chai";
import {StatementParser} from "../../src/abap/2_statements/statement_parser";
import * as Statements from "../../src/abap/2_statements/statements";
import {defaultVersion} from "../../src/version";
import {Lexer} from "../../src/abap/1_lexer/lexer";
import {MemoryFile} from "../../src/files/memory_file";


describe("macros", () => {

  it("Stupid macro", () => {
    const abap = `
DEFINE _if.
  if foo = bar.
END-OF-DEFINITION.

DEFINE _endif.
  endif.
END-OF-DEFINITION.

_if.
_endif.`;
    const lexerResult = Lexer.run(new MemoryFile("zmacros1.prog.abap", abap));
    const result = new StatementParser(defaultVersion).run([lexerResult], [])[0];
    expect(result.statements.length).to.equal(10);
  });

  it("no recursion please", () => {
    const abap = `
DEFINE _macro.
  WRITE &1.
END-OF-DEFINITION.
_macro '&1'.`;
    const lexerResult = Lexer.run(new MemoryFile("zmacros1.prog.abap", abap));
    const result = new StatementParser(defaultVersion).run([lexerResult], [])[0];
    expect(result.statements.length).to.equal(5);
  });

  it("simple macro", () => {
    const abap = `
DEFINE sub.
write foo.
write foo.
write foo.
END-OF-DEFINITION.

FORM moo.
  DATA foo TYPE c LENGTH 1.
  sub.
ENDFORM.`;
    const lexerResult = Lexer.run(new MemoryFile("zmacros3.prog.abap", abap));
    const result = new StatementParser(defaultVersion).run([lexerResult], [])[0];
    expect(result.statements.filter(s => s.get() instanceof Statements.Write).length).to.equal(3);
  });

  it("expand nested macros", () => {
    const abap = `
DEFINE sub.
write foo.
write foo.
write foo.
END-OF-DEFINITION.

DEFINE top.
sub.
END-OF-DEFINITION.

FORM moo.
  DATA foo TYPE c LENGTH 1.
  top.
ENDFORM.`;
    const lexerResult = Lexer.run(new MemoryFile("zmacros3.prog.abap", abap));
    const result = new StatementParser(defaultVersion).run([lexerResult], [])[0];
    expect(result.statements.filter(s => s.get() instanceof Statements.Write).length).to.equal(3);
  });

});