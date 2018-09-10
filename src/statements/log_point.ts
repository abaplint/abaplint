import {Statement} from "./statement";
import {str, seq, opt, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class LogPoint extends Statement {

  public static get_matcher(): IRunnable {
    let subkey = seq(str("SUBKEY"), new Reuse.Source());

    let fields = seq(str("FIELDS"), plus(new Reuse.Source()));

    let ret = seq(str("LOG-POINT ID"),
                  new Reuse.NamespaceSimpleName(),
                  opt(subkey),
                  opt(fields));

    return ret;
  }

}