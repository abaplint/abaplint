import {IStatement} from "./_statement";
import {str, verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndFunction implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, str("ENDFUNCTION"));
  }

}