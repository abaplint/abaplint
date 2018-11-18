import {Statement} from "./_statement";
import {verNot, str, seq, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class ReadReport extends Statement {

  public getMatcher(): IRunnable {
    const state = seq(str("STATE"), new Source());
    const into = seq(str("INTO"), new Target());
    const maximum = seq(str("MAXIMUM WIDTH INTO"), new Target());

    const ret = seq(str("READ REPORT"),
                    new Source(),
                    per(state, into, maximum));

    return verNot(Version.Cloud, ret);
  }

}