import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertTextpool implements IStatement {

  public getMatcher(): IStatementRunnable {
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