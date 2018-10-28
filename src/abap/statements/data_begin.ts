import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";

export class DataBegin extends Statement {

  public getMatcher(): IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let occurs = seq(str("OCCURS"), new Integer());

    let structure = seq(str("BEGIN OF"),
                        opt(str("COMMON PART")),
                        new NamespaceSimpleName(),
                        opt(str("READ-ONLY")),
                        opt(occurs));

    return seq(start, structure);
  }

}