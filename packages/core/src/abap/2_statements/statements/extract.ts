import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Extract implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("EXTRACT", opt(Field));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
