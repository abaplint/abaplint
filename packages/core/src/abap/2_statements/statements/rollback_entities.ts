import {IStatement} from "./_statement";
import {ver, verNotLang} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";

export class RollbackEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = "ROLLBACK ENTITIES";
    return verNotLang(LanguageVersion.KeyUser, ver(Release.v754, s));
  }

}