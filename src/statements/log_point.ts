import {Statement} from "./statement";
import {str, seq, opt, plus, IRunnable} from "../combi";
import {Source, NamespaceSimpleName} from "../expressions";

export class LogPoint extends Statement {

  public static get_matcher(): IRunnable {
    let subkey = seq(str("SUBKEY"), new Source());

    let fields = seq(str("FIELDS"), plus(new Source()));

    let ret = seq(str("LOG-POINT ID"),
                  new NamespaceSimpleName(),
                  opt(subkey),
                  opt(fields));

    return ret;
  }

}