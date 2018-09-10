import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SubtractCorresponding extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("SUBTRACT-CORRESPONDING"),
               new Reuse.Source(),
               str("FROM"),
               new Reuse.Target());
  }

}