import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Unpack extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("UNPACK"),
               new Reuse.Source(),
               str("TO"),
               new Reuse.Target());
  }

}