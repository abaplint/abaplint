import {IStatement} from "./_statement";
import {verNot, str, seqs, alt} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetRunTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const clock = seqs("CLOCK RESOLUTION", alt(str("LOW"), str("HIGH")));

    const analyzer = seqs("ANALYZER", alt(str("ON"), str("OFF")));

    const ret = seqs("SET RUN TIME", alt(clock, analyzer));

    return verNot(Version.Cloud, ret);
  }

}