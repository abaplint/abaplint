import {IStatement} from "./_statement";
import {verNotLang} from "../combi";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ProcessOnHelpRequest implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.Cloud, "PROCESS ON HELP-REQUEST");
  }

}
