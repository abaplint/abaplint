import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class GetRunTime extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("GET RUN TIME FIELD"), new Reuse.Target());
    return ret;
  }

}