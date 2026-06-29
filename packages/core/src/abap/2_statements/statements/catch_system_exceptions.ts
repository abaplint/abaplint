import {IStatement} from "./_statement";
import {verNotLang, seq, plus} from "../combi";
import {Field, Source} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CatchSystemExceptions implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("CATCH SYSTEM-EXCEPTIONS",
                    plus(seq(Field, "=", Source)));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
