import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, per, IRunnable} from "../combi";

export class GetDataset extends Statement {

  public static get_matcher(): IRunnable {
    let position = seq(str("POSITION"), new Reuse.Target());
    let attr = seq(str("ATTRIBUTES"), new Reuse.Target());

    let ret = seq(str("GET DATASET"),
                  new Reuse.Target(),
                  opt(per(position, attr)));

    return ret;
  }

}