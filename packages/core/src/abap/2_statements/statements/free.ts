import {IStatement} from "./_statement";
import {seq, verNotLang} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class Free implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FREE", Target);

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}