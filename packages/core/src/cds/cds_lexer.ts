import {Identifier} from "../abap/1_lexer/tokens";
import {Token} from "../abap/1_lexer/tokens/_token";
import {IFile} from "../files/_ifile";
import {Position} from "../position";

// todo: Keywords must be all uppercase, all lowercase, or in lowercase with an
// uppercase initial letter. Other mixes of uppercase and lowercase are not allowed

export class CDSLexer {
  public static run(file: IFile): Token[] {
    const step1: string[] = [];

    const lines = file.getRaw().replace(/\c/g, "").split("\n");

    for (const l of lines) {
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