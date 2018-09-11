import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class SubtractCorresponding extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("SUBTRACT-CORRESPONDING"),
               new Source(),
               str("FROM"),
               new Target());
  }

}