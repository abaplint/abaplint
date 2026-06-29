import {IStatement} from "./_statement";
import {verNotLang, str, seq, altPrio, optPrio, regex, starPrio} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Break implements IStatement {

  public getMatcher(): IStatementRunnable {
    const next = str("AT NEXT APPLICATION STATEMENT");

    // note BREAK is a special macro that wraps the parameter in a char
    const ret = altPrio(seq("BREAK-POINT", optPrio(altPrio(next, Source))),
                        seq("BREAK", starPrio(regex(/.*/))));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
