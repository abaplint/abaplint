import {IStatement} from "./_statement";
import {str, seqs, alts, per, altPrios, opts, plus, optPrio} from "../combi";
import {Target, Dynamic, ComponentChain, SourceFieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Sort implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = altPrios("ASCENDING", "DESCENDING");

    const sel = alts(ComponentChain, Dynamic, SourceFieldSymbol);

    const text = str("AS TEXT");

    const fields = plus(seqs(sel, optPrio(text), optPrio(order), optPrio(text)));

    const by = seqs("BY", fields);

    const normal = seqs(Target, opts(per(order, by, str("STABLE"), text)));

    const target = alts(normal, text);

    return seqs("SORT", target);
  }

}