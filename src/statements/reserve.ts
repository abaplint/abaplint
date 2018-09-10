import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Reserve extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("RESERVE"), new Reuse.Source(), str("LINES"));
  }

}