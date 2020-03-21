import {IStatement} from "./_statement";
import {verNot, str, seq, alt, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class SetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const clock = seq(str("CLOCK RESOLUTION"), alt(str("LOW"), str("HIGH")));

    const analyzer = seq(str("ANALYZER"), alt(str("ON"), str("OFF")));

    const ret = seq(str("SET RUN TIME"), alt(clock, analyzer));

    return verNot(Version.Cloud, ret);
  }

}