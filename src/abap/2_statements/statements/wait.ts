import {IStatement} from "./_statement";
import {verNot, str, seq, opt, per, alt, ver, IStatementRunnable} from "../combi";
import {Version} from "../../../version";
import {Source, Cond} from "../expressions";

export class Wait implements IStatement {

  public getMatcher(): IStatementRunnable {
    const up = seq(str("UP TO"), new Source(), str("SECONDS"));

    const channels = str("MESSAGING CHANNELS");
    const push = ver(Version.v750, str("PUSH CHANNELS"));
    const tasks = str("ASYNCHRONOUS TASKS");

    const type = seq(str("FOR"), per(channels, push, tasks));

    const until = seq(opt(type), str("UNTIL"), new Cond(), opt(up));

    const ret = seq(str("WAIT"), alt(until, up));

    return verNot(Version.Cloud, ret);
  }

}