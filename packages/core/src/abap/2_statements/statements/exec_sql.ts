import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {SimpleName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class ExecSQL implements IStatement {

  public getMatcher(): IStatementRunnable {
    const performing = seq("PERFORMING", SimpleName);

    const ret = seq("EXEC SQL", opt(performing));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
