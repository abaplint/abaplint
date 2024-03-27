import {MemoryFile} from "../../core/src/files/memory_file";
import {Lexer} from "../../core/src/abap/1_lexer/lexer";

export function main(filename: string, code: string) {
  const file = new MemoryFile(filename, code);
  const lexer = new Lexer();
  const result = lexer.run(file);
  return JSON.stringify(result);
}