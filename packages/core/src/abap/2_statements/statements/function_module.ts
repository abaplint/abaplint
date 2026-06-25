import {IStatement} from "./_statement";
import {seq, verNotLang} from "../combi";
import {Field} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModule implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("FUNCTION", Field));
  }

}