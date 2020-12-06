import {IStatement} from "./_statement";
import {verNot, seq, alt, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Communication implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seq("LENGTH", Target);

    const init = seq("INIT ID", Source, "DESTINATION", Target);
    const allocate = seq("ALLOCATE ID", Source);
    const send = seq("SEND ID", Source, "BUFFER", Target, opt(length));
    const deallocate = seq("DEALLOCATE ID", Source);
    const accept = seq("ACCEPT ID", Source);

    const receive = seq("RECEIVE ID",
                        Source,
                        "BUFFER",
                        Source,
                        opt(length),
                        "DATAINFO",
                        Target,
                        "STATUSINFO",
                        Target,
                        "RECEIVED",
                        Target);

    const ret = seq("COMMUNICATION",
                    alt(init, allocate, send, deallocate, receive, accept));

    return verNot(Version.Cloud, ret);
  }

}