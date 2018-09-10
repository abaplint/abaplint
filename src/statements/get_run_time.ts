import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Target} from "../expressions";

export class GetRunTime extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("GET RUN TIME FIELD"), new Target());
    return ret;
  }

}