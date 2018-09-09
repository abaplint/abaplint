import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Contexts extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CONTEXTS"),
               new Reuse.Field());
  }

}