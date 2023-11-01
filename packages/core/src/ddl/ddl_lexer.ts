import {Identifier} from "../abap/1_lexer/tokens";
import {AbstractToken} from "../abap/1_lexer/tokens/abstract_token";
import {IFile} from "../files/_ifile";
import {Position} from "../position";

export class DDLLexer {
  public static run(file: IFile): AbstractToken[] {
    const step1: string[] = [];

    const lines = file.getRaw().replace(/\r/g, "").split("\n");

    for (const l of lines) {
      if (l.startsWith("@")) {
        continue; // skip annotations for now
      }
      step1.push(...l.split(" "));
    }

    const step2: string[] = [];
    for (const t of step1) {
      if (t === "") {
        continue;
      } else if (t.endsWith(";")) {
        step2.push(t.substr(0, t.length - 1));
        step2.push(";");
      } else {
        step2.push(t);
      }
    }

    return step2.map(t => new Identifier(new Position(1, 1), t));
  }
}