import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {FieldSub, TableBody} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Local implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("LOCAL", FieldSub, opt(TableBody));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
