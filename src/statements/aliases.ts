import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Aliases extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("ALIASES"),
               new Reuse.Field(),
               str("FOR"),
               new Reuse.Field());
  }

}