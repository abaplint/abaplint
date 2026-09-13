import {IStatement} from "./_statement";
import {seq, opt, verNotLang} from "../combi";
import {Field, FunctionModuleParameters} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionModule implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser,
                      seq("FUNCTION", Field, opt(FunctionModuleParameters)));
  }

}