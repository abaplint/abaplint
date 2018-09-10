import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetScreen extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET SCREEN"), new Reuse.Source());
    return ret;
  }

}