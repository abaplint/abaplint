import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

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
                  new Target(),
                  str("LINE"),
                  new Target(),
                  str("WORD"),
                  new Target());

    return ret;
  }

}