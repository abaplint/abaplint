import {MemoryFile} from "../../core/src/files/memory_file";
import {Lexer} from "../../core/src/abap/1_lexer/lexer";

export function main(filename: string, code: string) {
  const file = new MemoryFile(filename, code);
  console.log("Running lexer...");
  const lexer = new Lexer();
  const result = lexer.run(file);
  return result.file.getFilename();
}

console.log(main("test.abap", "WRITE 'Hello World'."));