import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class Open extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("OPEN DATASET"), Reuse.field(), str("FOR OUTPUT"), opt(str("IN BINARY MODE")));
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Open(tokens);
    }
    return undefined;
  }

}