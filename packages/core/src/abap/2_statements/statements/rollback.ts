import {IStatement} from "./_statement";
import {seq, altPrio, verNotLang} from "../combi";
import {DatabaseConnection} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Rollback implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("ROLLBACK", altPrio("WORK", DatabaseConnection)));
  }

}