import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class DeleteTextpool extends Statement {

  public getMatcher(): IStatementRunnable {
    const language = seq(str("LANGUAGE"), new Source());
    const state = seq(str("STATE"), new Source());

    const ret = seq(str("DELETE TEXTPOOL"),
                    new Source(),
                    opt(language),
                    opt(state));

    return verNot(Version.Cloud, ret);
  }

}