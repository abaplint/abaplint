import {IStatement} from "./_statement";
import {str, verNotLang} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class LoopExtract implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, str("LOOP"));
  }

}