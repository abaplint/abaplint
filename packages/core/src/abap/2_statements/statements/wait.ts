import {IStatement} from "./_statement";
import {seq, opt, per, alt, ver, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {Source, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Wait implements IStatement {

  public getMatcher(): IStatementRunnable {
    const up = seq("UP TO", Source, "SECONDS");

    const channels = "MESSAGING CHANNELS";
    const push = ver(Release.v750, "PUSH CHANNELS", {also: AlsoIn.OpenABAP});
    const tasks = "ASYNCHRONOUS TASKS";

    const type = seq("FOR", per(channels, push, tasks));

    const until = seq(opt(type), "UNTIL", Cond, opt(up));

    const ret = seq("WAIT", alt(until, up));

    return ret;
  }

}