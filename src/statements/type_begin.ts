import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, IRunnable} from "../combi";

export class TypeBegin extends Statement {

  public static get_matcher(): IRunnable {
    let begin = seq(str("BEGIN OF"), new Reuse.NamespaceSimpleName());

    let ret = seq(alt(str("TYPE"), str("TYPES")), begin);

    return ret;
  }

}