import {IStatement} from "./_statement";
import {verNot, seq, optPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FreeMemory implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FREE MEMORY", optPrio(seq("ID", Source)));

    return verNot(Version.Cloud, ret);
  }

}