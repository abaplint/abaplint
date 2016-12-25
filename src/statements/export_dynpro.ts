import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class ExportDynpro extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("EXPORT DYNPRO"),
               new Reuse.Source(),
               new Reuse.Source(),
               new Reuse.Source(),
               new Reuse.Source(),
               str("ID"),
               new Reuse.Source());
  }

}