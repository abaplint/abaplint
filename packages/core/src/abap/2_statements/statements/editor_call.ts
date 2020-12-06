import {IStatement} from "./_statement";
import {verNot, seq, opts, pers} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seq("TITLE", Source);

    const options = pers("DISPLAY-MODE", title);

    const ret = seq("EDITOR-CALL FOR",
                    opts("REPORT"),
                    Source,
                    opts(options));

    return verNot(Version.Cloud, ret);
  }

}