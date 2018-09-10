import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class Position extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("POSITION"), new Reuse.Source());
  }

}