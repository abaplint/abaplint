import {IStatement} from "./_statement";
import {verNot, seqs, opts, pers, alts, vers} from "../combi";
import {Version} from "../../../version";
import {Source, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Wait implements IStatement {

  public getMatcher(): IStatementRunnable {
    const up = seqs("UP TO", Source, "SECONDS");

    const channels = "MESSAGING CHANNELS";
    const push = vers(Version.v750, "PUSH CHANNELS");
    const tasks = "ASYNCHRONOUS TASKS";

    const type = seqs("FOR", pers(channels, push, tasks));

    const until = seqs(opts(type), "UNTIL", Cond, opts(up));

    const ret = seqs("WAIT", alts(until, up));

    return verNot(Version.Cloud, ret);
  }

}