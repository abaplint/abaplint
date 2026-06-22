import {IStatement} from "./_statement";
import {verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EndOfDefinition implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.Cloud, "END-OF-DEFINITION");
  }

}
