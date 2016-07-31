import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let plus = Combi.plus;

export class Sort extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let fields = plus(seq(Reuse.field_sub(), opt(alt(str("ASCENDING"), str("DESCENDING"))), opt(str("AS TEXT"))));

    let dyn = seq(str("("), Reuse.source(), str(")"));

    let by = seq(str("BY"),
                 alt(fields, dyn));

    return seq(str("SORT"),
               Reuse.target(),
               opt(by));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Sort(tokens);
    }
    return undefined;
  }

}