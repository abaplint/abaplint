import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CreateOLE implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CREATE OBJECT",
                    Target,
                    Source,
                    opt("NO FLUSH"),
                    opt("QUEUE-ONLY"));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
