import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class SetDataset extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET DATASET"), new Reuse.Source(), str("POSITION"), new Reuse.Source());
    return ret;
  }

}