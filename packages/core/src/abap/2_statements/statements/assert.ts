import {IStatement} from "./_statement";
import {str, seq, opt, plus, optPrio} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq(str("FIELDS"), plus(new Source()));
    const subkey = seq(str("SUBKEY"), new Source());
    const id = seq(str("ID"), new NamespaceSimpleName());

    return seq(str("ASSERT"),
               optPrio(id),
               optPrio(subkey),
               opt(fields),
               optPrio(str("CONDITION")), new Cond());
  }

}