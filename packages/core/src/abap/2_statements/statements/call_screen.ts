import {IStatement} from "./_statement";
import {verNot, seqs, opts} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const starting = seqs("STARTING AT", Source, Source);
    const ending = seqs("ENDING AT", Source, Source);

    const ret = seqs("CALL SCREEN", Source, opts(seqs(starting, opts(ending))));

    return verNot(Version.Cloud, ret);
  }

}