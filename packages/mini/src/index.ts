import {MemoryFile} from "../../core/src/files/memory_file";
import {Lexer} from "../../core/src/abap/1_lexer/lexer";
import {StatementParser} from "../../core/src/abap/2_statements/statement_parser";
import {Version} from "../../core/src/version";

export function main(filename: string, code: string) {
  const file = new MemoryFile(filename, code);
  console.log("Running lexer...");
  const lexer = new Lexer();
  const lexerResult = lexer.run(file);

  console.log("Running statement parser...");
  const statementParser = new StatementParser(Version.v750);
  const result = statementParser.run([lexerResult], []);

  console.log("number of tokens: " + result[0]?.statements[0]?.getTokens().length);
  for (const statement of result[0].statements) {
    console.log("tokens: " + statement.concatTokens());
  }
}

main("test.prog.abap", "WRITE 'Hello World'.");
console.log("Done");