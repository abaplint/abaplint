import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class CloseDataset extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("CLOSE DATASET"), new Reuse.Target());
    return ret;
  }

}