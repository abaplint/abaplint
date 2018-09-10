import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class Subtract extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("SUBTRACT"),
               new Reuse.Source(),
               str("FROM"),
               new Reuse.Target());
  }

}