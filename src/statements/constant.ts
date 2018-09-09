import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, IRunnable} from "../combi";

export class Constant extends Statement {

  public static get_matcher(): IRunnable {
    let def = seq(new Reuse.NamespaceSimpleName(), opt(new Reuse.FieldLength()), opt(new Reuse.Type()), new Reuse.Value());

    let beginEnd = seq(alt(str("BEGIN"), str("END")), str("OF"), new Reuse.NamespaceSimpleName());

    let ret = seq(alt(str("CONSTANT"), str("CONSTANTS")), alt(def, beginEnd));

    return ret;
  }

}