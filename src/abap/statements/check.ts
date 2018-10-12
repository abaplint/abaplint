import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class Check extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("CHECK"), new Cond());

    return ret;
  }

}