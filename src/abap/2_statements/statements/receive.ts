import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {ReceiveParameters, FunctionName} from "../expressions";
import {Version} from "../../../version";

export class Receive extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("RECEIVE RESULTS FROM FUNCTION"),
                    new FunctionName(),
                    opt(str("KEEPING TASK")),
                    new ReceiveParameters());

    return verNot(Version.Cloud, ret);
  }

}