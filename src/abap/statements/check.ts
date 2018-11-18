import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class Check extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("CHECK"), new Cond());

    return ret;
  }

}