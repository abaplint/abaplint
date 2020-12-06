import {IStatement} from "./_statement";
import {str, seqs, opts, plus, optPrio} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seqs("FIELDS", plus(new Source()));
    const subkey = seqs("SUBKEY", Source);
    const id = seqs("ID", NamespaceSimpleName);

    return seqs("ASSERT",
                optPrio(id),
                optPrio(subkey),
                opts(fields),
                optPrio(str("CONDITION")),
                Cond);
  }

}