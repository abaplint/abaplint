import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class InsertTextpool extends Statement {

  public getMatcher(): IRunnable {
    const state = seq(str("STATE"), new Source());
    const language = seq(str("LANGUAGE"), new Source());

    const ret = seq(str("INSERT TEXTPOOL"),
                    new Source(),
                    str("FROM"),
                    new Source(),
                    opt(language),
                    opt(state));

    return verNot(Version.Cloud, ret);
  }

}