import {Statement} from "./statement";
import {str, seq, alt, IRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeEnd extends Statement {

  public static get_matcher(): IRunnable {
    let end = seq(str("END OF"), new NamespaceSimpleName());

    let ret = seq(alt(str("TYPE"), str("TYPES")), end);

    return ret;
  }

}