import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallSubscreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const including = seq("INCLUDING", Source, Source);

    const ret = seq("CALL SUBSCREEN", Source, optPrio(including));

    return verNot(Version.Cloud, ret);
  }

}