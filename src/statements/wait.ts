import {Statement} from "./statement";
import {str, seq, opt, alt, ver, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Version} from "../version";

export class Wait extends Statement {

  public static get_matcher(): IRunnable {
    let up = seq(str("UP TO"), new Reuse.Source(), str("SECONDS"));

    let channels = seq(alt(str("MESSAGING"), ver(Version.v750, str("PUSH"))), str("CHANNELS"));

    let tasks = str("ASYNCHRONOUS TASKS");

    let type = seq(str("FOR"), alt(channels, tasks));

    let until = seq(opt(type), str("UNTIL"), new Reuse.Cond(), opt(up));

    return seq(str("WAIT"), alt(until, up));
  }

}