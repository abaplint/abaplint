import {IStatement} from "./_statement";
import {verNot, seq, opt, per} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seq("TITLE", Source);

    const options = per("DISPLAY-MODE", title);

    const ret = seq("EDITOR-CALL FOR",
                    opt("REPORT"),
                    Source,
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}