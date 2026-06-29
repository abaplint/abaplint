import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetMargin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET MARGIN",
                    Source,
                    opt(Source));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
