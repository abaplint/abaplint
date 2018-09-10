import {Statement} from "./statement";
import {str, seq, regex as reg, IRunnable} from "../combi";

// type pool usage
export class TypePools extends Statement {

  public static get_matcher(): IRunnable {
    let fieldName = reg(/^\w+$/);

    let ret = seq(str("TYPE-POOLS"), fieldName);

    return ret;
  }

}