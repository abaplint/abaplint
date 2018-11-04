import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Overlay extends Statement {

  public getMatcher(): IRunnable {
    let only = seq(str("ONLY"), new Source());

    let ret = seq(str("OVERLAY"),
                  new Target(),
                  str("WITH"),
                  new Source(),
                  opt(only));

    return verNot(Version.Cloud, ret);
  }

}