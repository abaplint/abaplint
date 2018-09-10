import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class SuppressDialog extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("SUPPRESS DIALOG");
    return ret;
  }

}