import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class GenerateDynpro extends Statement {

  public static get_matcher(): IRunnable {
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