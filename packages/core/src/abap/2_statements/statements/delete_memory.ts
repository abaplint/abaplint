import {IStatement} from "./_statement";
import {verNot, seqs, alt} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteMemory implements IStatement {

  public getMatcher(): IStatementRunnable {
    const memory = seqs("MEMORY ID", Source);

    const id = seqs("ID", Source);
    const shared = seqs("SHARED MEMORY",
                        Field,
                        "(",
                        Field,
                        ")",
                        id);

    const ret = seqs("DELETE FROM", alt(memory, shared));

    return verNot(Version.Cloud, ret);
  }

}