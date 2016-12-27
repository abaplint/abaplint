import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;

export class DataEnd extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let structure = seq(str("END OF"),
                        alt(new Reuse.SimpleName(), str("COMMON PART")));

    return seq(start, structure);
  }

}