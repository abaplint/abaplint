import {Statement} from "./statement";
import {verNot, str, seq, alt, IRunnable} from "../combi";
import {Version} from "../../version";

export class SetRunTime extends Statement {

  public static get_matcher(): IRunnable {
    let clock = seq(str("CLOCK RESOLUTION"), alt(str("LOW"), str("HIGH")));

    let analyzer = seq(str("ANALYZER"), alt(str("ON"), str("OFF")));

    let ret = seq(str("SET RUN TIME"), alt(clock, analyzer));

    return verNot(Version.Cloud, ret);
  }

}