import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class Update extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.field(), Reuse.dynamic());

    let ret = seq(str("UPDATE"),
                  target,
                  str("SET"),
                  Reuse.parameter_list_s(),
                  opt(seq(str("WHERE"), Reuse.cond())));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Update(tokens);
    }
    return undefined;
  }

}