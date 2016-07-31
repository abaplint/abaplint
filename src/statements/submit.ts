import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let star = Combi.star;

export class Submit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let awith = seq(str("WITH"), Reuse.field(), str("="), Reuse.source());
    let ret = seq(str("SUBMIT"), Reuse.source(), star(awith), opt(str("AND RETURN")));
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Submit(tokens);
    }
    return undefined;
  }

}