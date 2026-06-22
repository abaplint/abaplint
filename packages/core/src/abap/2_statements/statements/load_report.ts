import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LoadReport implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("LOAD REPORT",
                    Source,
                    "PART",
                    Source,
                    "INTO",
                    Target);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
