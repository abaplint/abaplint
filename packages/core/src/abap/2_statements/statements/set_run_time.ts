import {IStatement} from "./_statement";
import {verNot, seqs, alts} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const clock = seqs("CLOCK RESOLUTION", alts("LOW", "HIGH"));

    const analyzer = seqs("ANALYZER", alts("ON", "OFF"));

    const ret = seqs("SET RUN TIME", alts(clock, analyzer));

    return verNot(Version.Cloud, ret);
  }

}