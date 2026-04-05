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

  return JSON.stringify(result[0].statements);
}

console.log(main("test.abap", "WRITE 'Hello World'."));