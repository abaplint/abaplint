import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Insert extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.source(), seq(str("("), Reuse.field(), str(")")));

    let ret = seq(str("INSERT"),
                  target,
                  alt(str("FROM"), str("INTO")),
                  opt(str("TABLE")),
                  Reuse.source());

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Insert(tokens);
    }
    return undefined;
  }

}