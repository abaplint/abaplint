import {IStatement} from "./_statement";
import {seq, ver, verNotLang} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release, LanguageVersion} from "../../../version";

export class SetLocks implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq("SET LOCKS OF",
                  SimpleName,
                  "ENTITY",
                  SimpleName,
                  "FROM", Source,
                  "FAILED", Target,
                  "REPORTED", Target);
    return verNotLang(LanguageVersion.KeyUser, ver(Release.v754, s));
  }

}