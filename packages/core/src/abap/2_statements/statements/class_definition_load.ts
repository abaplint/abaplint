import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, verNotLang} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinitionLoad implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("CLASS", ClassName, "DEFINITION LOAD"));
  }

}