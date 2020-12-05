import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alt, per} from "../combi";
import {FormName, Source, FunctionParameters, FunctionName, Destination, MethodName, BasicSource} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallFunction implements IStatement {

  public getMatcher(): IStatementRunnable {
    const method = new MethodName();

    const starting = seqs("STARTING NEW TASK", BasicSource);
    const update = str("IN UPDATE TASK");
    const unit = seqs("UNIT", Source);
    const background = seqs("IN BACKGROUND", alt(str("TASK"), unit));
    const calling = seqs("CALLING", method, "ON END OF TASK");
    const performing = seqs("PERFORMING", FormName, "ON END OF TASK");
    const separate = str("AS SEPARATE UNIT");
    const keeping = str("KEEPING LOGICAL UNIT OF WORK");

    const options = per(starting, update, background, new Destination(), calling, performing, separate, keeping);

    const dynamic = seqs("PARAMETER-TABLE", Source,
                         opt(seqs("EXCEPTION-TABLE", Source)));

    const call = seqs("CALL",
                      alt(str("FUNCTION"), verNot(Version.Cloud, str("CUSTOMER-FUNCTION"))),
                      FunctionName,
                      opt(options),
                      alt(new FunctionParameters(), dynamic));

    return call;
  }

}