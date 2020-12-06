import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {ReceiveParameters, FunctionName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Receive implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("RECEIVE RESULTS FROM FUNCTION",
                    FunctionName,
                    opts("KEEPING TASK"),
                    ReceiveParameters);

    return verNot(Version.Cloud, ret);
  }

}