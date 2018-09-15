import {Statement} from "./statement";
import {verNot, str, seq, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../version";

export class ReadTextpool extends Statement {

  public static get_matcher(): IRunnable {
    let language = seq(str("LANGUAGE"), new Source());
    let into = seq(str("INTO"), new Target());
    let state = seq(str("STATE"), new Source());

    let ret = seq(str("READ TEXTPOOL"),
                  new Source(),
                  per(into, language, state));

    return verNot(Version.Cloud, ret);
  }

}