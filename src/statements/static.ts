import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, IRunnable} from "../combi";

export class Static extends Statement {

  public static get_matcher(): IRunnable {
    let type = seq(opt(new Reuse.FieldLength()), new Reuse.Type());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new Reuse.NamespaceSimpleName(),
                  opt(alt(type, new Reuse.TypeTable())),
                  opt(new Reuse.Value()));

    return ret;
  }

}