import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class Extract extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("EXTRACT"), new Reuse.Field());
  }

}