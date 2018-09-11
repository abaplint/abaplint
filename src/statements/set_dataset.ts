import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";

export class SetDataset extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("SET DATASET"), new Source(), str("POSITION"), new Source());
    return ret;
  }

}