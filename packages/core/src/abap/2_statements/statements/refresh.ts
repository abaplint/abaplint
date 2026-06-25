import {IStatement} from "./_statement";
import {verNotLang, seq, optPrio} from "../combi";
import {Target, DatabaseTable} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Refresh implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq("FROM TABLE", DatabaseTable);

    const ret = seq("REFRESH", Target, optPrio(from));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
