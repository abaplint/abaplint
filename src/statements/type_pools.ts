import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let reg = Combi.regex;

// type pool usage
export class TypePools extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let fieldName = reg(/^\w+$/);

    let ret = seq(str("TYPE-POOLS"), fieldName);

    return ret;
  }

}