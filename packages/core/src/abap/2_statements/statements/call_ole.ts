import {IStatement} from "./_statement";
import {verNotLang, seq, opt, alt} from "../combi";
import {Target, Source, OLEExporting} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const rc = seq("=", Target);

    const ret = seq("CALL METHOD OF",
                    Source,
                    Source,
                    opt(rc),
                    opt("NO FLUSH"),
                    opt(alt("QUEUE-ONLY", "QUEUEONLY")),
                    opt(OLEExporting));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
