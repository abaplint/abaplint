import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const starting = seq("STARTING AT", Source, Source);
    const ending = seq("ENDING AT", Source, Source);

    const ret = seq("CALL SCREEN", Source, optPrio(seq(starting, optPrio(ending))));

    return verNot(Version.Cloud, ret);
  }

}