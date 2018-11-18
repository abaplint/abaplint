import {Statement} from "./_statement";
import {verNot, str, seq, alt, IRunnable} from "../combi";
import {Version} from "../../version";

export class SetRunTime extends Statement {

  public getMatcher(): IRunnable {
    const clock = seq(str("CLOCK RESOLUTION"), alt(str("LOW"), str("HIGH")));

    const analyzer = seq(str("ANALYZER"), alt(str("ON"), str("OFF")));

    const ret = seq(str("SET RUN TIME"), alt(clock, analyzer));

    return verNot(Version.Cloud, ret);
  }

}