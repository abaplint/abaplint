import {IStatement} from "./_statement";
import {verNot, seq, alts} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteMemory implements IStatement {

  public getMatcher(): IStatementRunnable {
    const memory = seq("MEMORY ID", Source);

    const id = seq("ID", Source);
    const shared = seq("SHARED MEMORY", Field, "(", Field, ")", id);

    const ret = seq("DELETE FROM", alts(memory, shared));

    return verNot(Version.Cloud, ret);
  }

}