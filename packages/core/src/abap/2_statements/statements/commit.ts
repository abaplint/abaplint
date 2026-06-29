import {IStatement} from "./_statement";
import {seq, opt, alt, verNotLang} from "../combi";
import {DatabaseConnection} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Commit implements IStatement {

  public getMatcher(): IStatementRunnable {
    const work = seq("WORK", opt("AND WAIT"));

    return verNotLang(LanguageVersion.KeyUser, seq("COMMIT", alt(work, DatabaseConnection)));
  }

}