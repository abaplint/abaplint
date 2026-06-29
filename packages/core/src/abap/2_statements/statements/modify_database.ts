import {IStatement} from "./_statement";
import {seq, opt, per, verNotLang} from "../combi";
import {DatabaseTable, SQLSource, DatabaseConnection, SQLClient} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {

    const from = seq("FROM", opt("TABLE"), SQLSource);

    const options = per(DatabaseConnection, from, SQLClient);

    return verNotLang(LanguageVersion.KeyUser, seq("MODIFY", DatabaseTable, options));
  }

}