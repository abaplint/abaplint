import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";

export class Subtract extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("SUBTRACT"),
               new Source(),
               str("FROM"),
               new Target());
  }

}