import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class Check extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CHECK"), new Cond());

    return ret;
  }

}