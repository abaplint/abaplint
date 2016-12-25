import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class SuppressDialog extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = str("SUPPRESS DIALOG");
    return ret;
  }

}