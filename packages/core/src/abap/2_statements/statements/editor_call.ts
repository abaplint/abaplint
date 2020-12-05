import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seqs("TITLE", Source);

    const options = per(str("DISPLAY-MODE"), title);

    const ret = seqs("EDITOR-CALL FOR",
                     opt(str("REPORT")),
                     Source,
                     opt(options));

    return verNot(Version.Cloud, ret);
  }

}