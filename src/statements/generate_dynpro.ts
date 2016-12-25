import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class GenerateDynpro extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("GENERATE DYNPRO"),
                  new Reuse.Source(),
                  new Reuse.Source(),
                  new Reuse.Source(),
                  new Reuse.Source(),
                  str("ID"),
                  new Reuse.Source(),
                  str("MESSAGE"),
                  new Reuse.Target(),
                  str("LINE"),
                  new Reuse.Target(),
                  str("WORD"),
                  new Reuse.Target());

    return ret;
  }

}