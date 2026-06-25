import {IStatement} from "./_statement";
import {verNotLang, seq, per, opt, plus} from "../combi";
import {Target, Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Get implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq("FIELDS", plus(Field));

    const options = per("LATE", fields);

    const ret = seq("GET",
                    Target,
                    opt(options));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
