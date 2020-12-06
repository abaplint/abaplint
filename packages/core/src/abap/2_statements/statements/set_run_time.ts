import {IStatement} from "./_statement";
import {verNot, seq, alts} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const clock = seq("CLOCK RESOLUTION", alts("LOW", "HIGH"));

    const analyzer = seq("ANALYZER", alts("ON", "OFF"));

    const ret = seq("SET RUN TIME", alts(clock, analyzer));

    return verNot(Version.Cloud, ret);
  }

}