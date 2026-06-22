import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ModifyScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("MODIFY SCREEN", opt(seq("FROM", Source)));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
