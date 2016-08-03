import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class InsertInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let target = alt(Reuse.source(), Reuse.dynamic());
    let assigning = seq(str("ASSIGNING"), Reuse.field_symbol());

    let ret = seq(str("INSERT"),
                  opt(str("LINES OF")),
                  target,
                  str("INTO TABLE"),
                  Reuse.source(),
                  opt(assigning));

    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new InsertInternal(tokens);
    }
    return undefined;
  }

}