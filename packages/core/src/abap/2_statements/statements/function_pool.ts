import {IStatement} from "./_statement";
import {str, seq, opt, per, verNotLang} from "../combi";
import {MessageClass, Integer, IncludeName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FunctionPool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const message = seq("MESSAGE-ID", MessageClass);
    const line = seq("LINE-SIZE", Integer);
    const no = str("NO STANDARD PAGE HEADING");

    return verNotLang(LanguageVersion.KeyUser, seq("FUNCTION-POOL",
                                                   IncludeName,
                                                   opt(per(message, line, no))));
  }

}