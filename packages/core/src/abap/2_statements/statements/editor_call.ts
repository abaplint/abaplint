import {IStatement} from "./_statement";
import {verNotLang, seq, per, optPrio} from "../combi";
import {SimpleSource3, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seq("TITLE", SimpleSource3);

    const options = per("DISPLAY-MODE", title);

    const ret = seq("EDITOR-CALL FOR",
                    optPrio("REPORT"),
                    Source,
                    optPrio(options));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
