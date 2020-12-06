import {IStatement} from "./_statement";
import {seqs, opts, plus, optPrios} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seqs("FIELDS", plus(new Source()));
    const subkey = seqs("SUBKEY", Source);
    const id = seqs("ID", NamespaceSimpleName);

    return seqs("ASSERT",
                optPrios(id),
                optPrios(subkey),
                opts(fields),
                optPrios("CONDITION"),
                Cond);
  }

}