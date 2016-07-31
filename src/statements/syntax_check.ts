import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SyntaxCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SYNTAX-CHECK FOR"),
                  Reuse.source(),
                  str("MESSAGE"),
                  Reuse.target(),
                  str("LINE"),
                  Reuse.target(),
                  str("WORD"),
                  Reuse.target(),
                  str("DIRECTORY ENTRY"),
                  Reuse.source());

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new SyntaxCheck(tokens);
    }
    return undefined;
  }

}