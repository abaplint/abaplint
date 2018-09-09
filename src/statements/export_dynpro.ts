import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class ExportDynpro extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("EXPORT DYNPRO"),
               new Reuse.Source(),
               new Reuse.Source(),
               new Reuse.Source(),
               new Reuse.Source(),
               str("ID"),
               new Reuse.Source());
  }

}