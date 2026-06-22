import {IStatement} from "./_statement";
import {verNotLang, seq, optPrio, opt, alt} from "../combi";
import {Source, Constant, Field, OLEExporting} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET PROPERTY OF",
                    Source,
                    alt(Constant, Field),
                    "=",
                    Source,
                    optPrio("NO FLUSH"),
                    opt(OLEExporting),
                    opt("QUEUEONLY"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
