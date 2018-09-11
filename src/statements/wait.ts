import {Statement} from "./statement";
import {str, seq, opt, alt, ver, IRunnable} from "../combi";
import {Version} from "../version";
import {Source, Cond} from "../expressions";

export class Wait extends Statement {

  public static get_matcher(): IRunnable {
    let up = seq(str("UP TO"), new Source(), str("SECONDS"));

    let channels = seq(alt(str("MESSAGING"), ver(Version.v750, str("PUSH"))), str("CHANNELS"));

    let tasks = str("ASYNCHRONOUS TASKS");

    let type = seq(str("FOR"), alt(channels, tasks));

    let until = seq(opt(type), str("UNTIL"), new Cond(), opt(up));

    return seq(str("WAIT"), alt(until, up));
  }

}