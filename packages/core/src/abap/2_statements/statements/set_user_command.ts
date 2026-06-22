import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetUserCommand implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET USER-COMMAND", Source);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
