import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let optPrio = Combi.optPrio;

export class DataEnd extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let common = seq(str("COMMON PART"), optPrio(new Reuse.SimpleName()));

    let structure = seq(str("END OF"),
                        alt(common, new Reuse.NamespaceSimpleName()));

    return seq(start, structure);
  }

}