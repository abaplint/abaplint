import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Integer} from "../expressions";

export class DataBegin extends Statement {

  public static get_matcher(): IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let occurs = seq(str("OCCURS"), new Integer());

    let structure = seq(str("BEGIN OF"),
                        opt(str("COMMON PART")),
                        new Reuse.NamespaceSimpleName(),
                        opt(occurs));

    return seq(start, structure);
  }

}