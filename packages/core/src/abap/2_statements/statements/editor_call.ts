import {IStatement} from "./_statement";
import {verNot, seqs, opts, pers} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seqs("TITLE", Source);

    const options = pers("DISPLAY-MODE", title);

    const ret = seqs("EDITOR-CALL FOR",
                     opts("REPORT"),
                     Source,
                     opts(options));

    return verNot(Version.Cloud, ret);
  }

}