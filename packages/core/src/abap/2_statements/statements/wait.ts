import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, per, alts, ver} from "../combi";
import {Version} from "../../../version";
import {Source, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Wait implements IStatement {

  public getMatcher(): IStatementRunnable {
    const up = seqs("UP TO", Source, "SECONDS");

    const channels = str("MESSAGING CHANNELS");
    const push = ver(Version.v750, str("PUSH CHANNELS"));
    const tasks = str("ASYNCHRONOUS TASKS");

    const type = seqs("FOR", per(channels, push, tasks));

    const until = seqs(opt(type), "UNTIL", Cond, opt(up));

    const ret = seqs("WAIT", alts(until, up));

    return verNot(Version.Cloud, ret);
  }

}