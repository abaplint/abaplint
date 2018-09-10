import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Interface extends Statement {

  public static get_matcher(): IRunnable {
    let options = alt(str("PUBLIC"), str("LOAD"), str("DEFERRED"));

    return seq(str("INTERFACE"),
               new Reuse.Field(),
               opt(options));
  }

  public indentationEnd(_prev) {
    return 2;
  }

}