import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, ver, IRunnable} from "../combi";
import {Version} from "../../version";
import {Source, Cond} from "../expressions";

export class Wait extends Statement {

  public getMatcher(): IRunnable {
    const up = seq(str("UP TO"), new Source(), str("SECONDS"));

    const channels = seq(alt(str("MESSAGING"), ver(Version.v750, str("PUSH"))), str("CHANNELS"));

    const tasks = str("ASYNCHRONOUS TASKS");

    const type = seq(str("FOR"), alt(channels, tasks));

    const until = seq(opt(type), str("UNTIL"), new Cond(), opt(up));

    const ret = seq(str("WAIT"), alt(until, up));

    return verNot(Version.Cloud, ret);
  }

}