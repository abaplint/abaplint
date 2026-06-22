import {IStatement} from "./_statement";
import {verNotLang, seq, opt} from "../combi";
import {ReceiveParameters, FunctionName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Receive implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("RECEIVE RESULTS FROM FUNCTION",
                    FunctionName,
                    opt("KEEPING TASK"),
                    ReceiveParameters);

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
