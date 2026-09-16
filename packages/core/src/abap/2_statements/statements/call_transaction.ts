import {IStatement} from "./_statement";
import {verNotLang, seq, opt, altPrio, per, optPrio, ver} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion, Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallTransaction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const options = seq("OPTIONS FROM", Source);
    const messages = seq("MESSAGES INTO", Target);

    const auth = ver(Release.v740sp02, seq(altPrio("WITH", "WITHOUT"), "AUTHORITY-CHECK"));

    const perm = per(seq("UPDATE", Source),
                     "AND SKIP FIRST SCREEN",
                     options,
                     messages,
                     seq("MODE", Source));

    const ret = seq("CALL TRANSACTION",
                    Source,
                    optPrio(auth),
                    optPrio(seq("USING", Source)),
                    opt(perm));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
