import {IStatement} from "./_statement";
import {verNot, seq, alt, optPrio, altPrio} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteMemory implements IStatement {

  public getMatcher(): IStatementRunnable {
    const memory = seq("MEMORY ID", Source);

    const id = seq("ID", Source);
    const client = seq("CLIENT", Source);
    const shared = seq("SHARED", altPrio("MEMORY", "BUFFER"), Field, "(", Field, ")", optPrio(client), id);

    const ret = seq("DELETE FROM", alt(memory, shared));

    return verNot(Version.Cloud, ret);
  }

}