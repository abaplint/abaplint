import {IStatement} from "./_statement";
import {seq, alt, per, altPrio, opt, plus, optPrio} from "../combi";
import {Target, Dynamic, ComponentChain, SourceFieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Sort implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = altPrio("ASCENDING", "DESCENDING");

    const sel = alt(ComponentChain, Dynamic, SourceFieldSymbol);

    const text = "AS TEXT";

    const fields = plus(seq(sel, optPrio(text), optPrio(order), optPrio(text)));

    const by = seq("BY", fields);

    const normal = seq(Target, opt(per(order, by, "STABLE", text)));

    const target = altPrio(text, normal);

    return seq("SORT", target);
  }

}