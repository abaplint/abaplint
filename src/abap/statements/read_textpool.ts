import {Statement} from "./_statement";
import {verNot, str, seq, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class ReadTextpool extends Statement {

  public getMatcher(): IRunnable {
    const language = seq(str("LANGUAGE"), new Source());
    const into = seq(str("INTO"), new Target());
    const state = seq(str("STATE"), new Source());

    const ret = seq(str("READ TEXTPOOL"),
                    new Source(),
                    per(into, language, state));

    return verNot(Version.Cloud, ret);
  }

}