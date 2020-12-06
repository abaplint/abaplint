import {IStatement} from "./_statement";
import {verNot, seqs, alts, opts} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Communication implements IStatement {

  public getMatcher(): IStatementRunnable {
    const length = seqs("LENGTH", Target);

    const init = seqs("INIT ID", Source, "DESTINATION", Target);
    const allocate = seqs("ALLOCATE ID", Source);
    const send = seqs("SEND ID", Source, "BUFFER", Target, opts(length));
    const deallocate = seqs("DEALLOCATE ID", Source);
    const accept = seqs("ACCEPT ID", Source);

    const receive = seqs("RECEIVE ID",
                         Source,
                         "BUFFER",
                         Source,
                         opts(length),
                         "DATAINFO",
                         Target,
                         "STATUSINFO",
                         Target,
                         "RECEIVED",
                         Target);

    const ret = seqs("COMMUNICATION",
                     alts(init, allocate, send, deallocate, receive, accept));

    return verNot(Version.Cloud, ret);
  }

}