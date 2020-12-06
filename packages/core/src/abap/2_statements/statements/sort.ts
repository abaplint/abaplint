import {IStatement} from "./_statement";
import {seq, alt, pers, altPrios, opts, pluss, optPrios} from "../combi";
import {Target, Dynamic, ComponentChain, SourceFieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Sort implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = altPrios("ASCENDING", "DESCENDING");

    const sel = alt(ComponentChain, Dynamic, SourceFieldSymbol);

    const text = "AS TEXT";

    const fields = pluss(seq(sel, optPrios(text), optPrios(order), optPrios(text)));

    const by = seq("BY", fields);

    const normal = seq(Target, opts(pers(order, by, "STABLE", text)));

    const target = alt(normal, text);

    return seq("SORT", target);
  }

}