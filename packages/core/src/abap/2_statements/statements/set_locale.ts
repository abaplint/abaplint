import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetLocale implements IStatement {

  public getMatcher(): IStatementRunnable {
    const country = seq("COUNTRY", Source);

    const modifier = seq("MODIFIER", Source);

    const ret = seq("SET LOCALE LANGUAGE",
                    Source,
                    opt(country),
                    opt(modifier));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
