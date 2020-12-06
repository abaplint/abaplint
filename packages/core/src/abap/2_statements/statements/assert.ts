import {IStatement} from "./_statement";
import {seq, opts, pluss, optPrios} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq("FIELDS", pluss(Source));
    const subkey = seq("SUBKEY", Source);
    const id = seq("ID", NamespaceSimpleName);

    return seq("ASSERT",
               optPrios(id),
               optPrios(subkey),
               opts(fields),
               optPrios("CONDITION"),
               Cond);
  }

}