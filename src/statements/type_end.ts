import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, IRunnable} from "../combi";

export class TypeEnd extends Statement {

  public static get_matcher(): IRunnable {
    let end = seq(str("END OF"), new Reuse.NamespaceSimpleName());

    let ret = seq(alt(str("TYPE"), str("TYPES")), end);

    return ret;
  }

}