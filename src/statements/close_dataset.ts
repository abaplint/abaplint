import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class CloseDataset extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CLOSE DATASET"), new Target());
    return ret;
  }

}