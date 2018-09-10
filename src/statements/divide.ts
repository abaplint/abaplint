import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class Divide extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("DIVIDE"),
               new Target(),
               str("BY"),
               new Reuse.Source());
  }

}