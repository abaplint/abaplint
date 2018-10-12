import {Statement} from "./statement";
import {verNot, str, seq, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class ReadReport extends Statement {

  public get_matcher(): IRunnable {
    let state = seq(str("STATE"), new Source());
    let into = seq(str("INTO"), new Target());
    let maximum = seq(str("MAXIMUM WIDTH INTO"), new Target());

    let ret = seq(str("READ REPORT"),
                  new Source(),
                  per(state, into, maximum));

    return verNot(Version.Cloud, ret);
  }

}