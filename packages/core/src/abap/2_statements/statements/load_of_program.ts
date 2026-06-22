import {IStatement} from "./_statement";
import {verNotLang, str} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LoadOfProgram implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("LOAD-OF-PROGRAM");

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
