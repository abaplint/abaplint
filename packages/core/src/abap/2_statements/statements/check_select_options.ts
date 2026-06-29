import {IStatement} from "./_statement";
import {verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CheckSelectOptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = "CHECK SELECT-OPTIONS";

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
