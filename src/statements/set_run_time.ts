import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;

export class SetRunTime extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = str("SET RUN TIME CLOCK RESOLUTION LOW");
    return ret;
  }

}