import {Statement} from "./statement";
import {str, seq, opt, per, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetDataset extends Statement {

  public static get_matcher(): IRunnable {
    let position = seq(str("POSITION"), new Target());
    let attr = seq(str("ATTRIBUTES"), new Target());

    let ret = seq(str("GET DATASET"),
                  new Target(),
                  opt(per(position, attr)));

    return ret;
  }

}