import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;

export class Do extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("DO"), opt(seq(Reuse.source(), str("TIMES"))));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Do(tokens);
    }
    return undefined;
  }

}