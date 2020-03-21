import {IStatement} from "./_statement";
import {str, seq, opt, plus, IStatementRunnable} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";

export class Assert implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq(str("FIELDS"), plus(new Source()));
    const subkey = seq(str("SUBKEY"), new Source());
    const id = seq(str("ID"), new NamespaceSimpleName());

    return seq(str("ASSERT"),
               opt(id),
               opt(subkey),
               opt(fields),
               opt(str("CONDITION")), new Cond());
  }

}