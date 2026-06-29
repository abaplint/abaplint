import {IStatement} from "./_statement";
import {seq, optPrio, verNotLang} from "../combi";
import {ClassName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("CLASS", ClassName, "DEFINITION DEFERRED", optPrio("PUBLIC")));
  }

}