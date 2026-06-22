import {IStatement} from "./_statement";
import {verNotLang, str} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SuppressDialog implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("SUPPRESS DIALOG");

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
