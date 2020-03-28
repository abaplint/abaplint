import {IStatement} from "./_statement";
import {verNot, str, seq, opt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seq(str("TITLE"), new Source());

    const options = per(str("DISPLAY-MODE"), title);

    const ret = seq(str("EDITOR-CALL FOR"),
                    opt(str("REPORT")),
                    new Source(),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}