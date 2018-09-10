import {Statement} from "./statement";
import {str, seq, regex as reg, IRunnable} from "../combi";

// type pool definition
export class TypePool extends Statement {

  public static get_matcher(): IRunnable {
    let fieldName = reg(/^\w+$/);

    let ret = seq(str("TYPE-POOL"), fieldName);

    return ret;
  }

}