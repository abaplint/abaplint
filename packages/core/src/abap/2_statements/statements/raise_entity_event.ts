import {IStatement} from "./_statement";
import {seq, verNotLang} from "../combi";
import {EventName, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class RaiseEntityEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("RAISE ENTITY EVENT", EventName, "FROM", Source));
  }

}