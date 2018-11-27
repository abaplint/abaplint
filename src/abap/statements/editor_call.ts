import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class EditorCall extends Statement {

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