import {Statement} from "./statement";
import {str, seq, alt, optPrio, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class DataEnd extends Statement {

  public static get_matcher(): IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let common = seq(str("COMMON PART"), optPrio(new Reuse.SimpleName()));

    let structure = seq(str("END OF"),
                        alt(common, new Reuse.NamespaceSimpleName()));

    return seq(start, structure);
  }

}