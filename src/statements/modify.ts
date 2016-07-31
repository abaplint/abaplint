import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class Modify extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.field(), seq(str("("), Reuse.field(), str(")")));

    let ret = seq(str("MODIFY"), target, str("FROM"), Reuse.source());
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Modify(tokens);
    }
    return undefined;
  }

}