import {IStatement} from "./_statement";
import {verNotLang, seq, per, optPrio, altPrio} from "../combi";
import {SimpleSource3, Source, Target} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EditorCall implements IStatement {

  public getMatcher(): IStatementRunnable {
    const title = seq("TITLE", SimpleSource3);

    const options = per("DISPLAY-MODE", title);
    const report = seq("REPORT", Source, optPrio(options));
    const display = altPrio(seq(Source, "DISPLAY-MODE", optPrio(title)),
                            seq(Source, title, "DISPLAY-MODE"));
    const edit = seq(Target, optPrio(title));

    const ret = seq("EDITOR-CALL FOR",
                    altPrio(report, display, edit));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
