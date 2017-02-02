import {Statement} from "./statement";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class SetRunTime extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let clock = seq(str("CLOCK RESOLUTION"), alt(str("LOW"), str("HIGH")));

    let analyzer = seq(str("ANALYZER"), alt(str("ON"), str("OFF")));

    let ret = seq(str("SET RUN TIME"), alt(clock, analyzer));

    return ret;
  }

}