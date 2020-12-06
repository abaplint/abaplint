import {IStatement} from "./_statement";
import {verNot, seq, opt, pers, alt, vers} from "../combi";
import {Version} from "../../../version";
import {Source, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Wait implements IStatement {

  public getMatcher(): IStatementRunnable {
    const up = seq("UP TO", Source, "SECONDS");

    const channels = "MESSAGING CHANNELS";
    const push = vers(Version.v750, "PUSH CHANNELS");
    const tasks = "ASYNCHRONOUS TASKS";

    const type = seq("FOR", pers(channels, push, tasks));

    const until = seq(opt(type), "UNTIL", Cond, opt(up));

    const ret = seq("WAIT", alt(until, up));

    return verNot(Version.Cloud, ret);
  }

}