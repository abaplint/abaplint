import {IStatement} from "./_statement";
import {ver, verNotLang} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";

export class EndWith implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, ver(Release.v751, "ENDWITH"));
  }

}