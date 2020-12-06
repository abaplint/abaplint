import {IStatement} from "./_statement";
import {seq, opt, plus, optPrio} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq("FIELDS", plus(Source));
    const subkey = seq("SUBKEY", Source);
    const id = seq("ID", NamespaceSimpleName);

    return seq("ASSERT",
               optPrio(id),
               optPrio(subkey),
               opt(fields),
               optPrio("CONDITION"),
               Cond);
  }

}