import {IStatement} from "./_statement";
import {verNot, str, seq, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";

export class ReadTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const language = seq(str("LANGUAGE"), new Source());
    const into = seq(str("INTO"), new Target());
    const state = seq(str("STATE"), new Source());

    const ret = seq(str("READ TEXTPOOL"),
                    new Source(),
                    per(into, language, state));

    return verNot(Version.Cloud, ret);
  }

}