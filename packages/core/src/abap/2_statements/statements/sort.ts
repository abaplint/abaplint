import {IStatement} from "./_statement";
import {str, seq, alt, per, altPrio, opt, plus, optPrio} from "../combi";
import {Target, Dynamic, ComponentChain, SourceFieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Sort implements IStatement {

  public getMatcher(): IStatementRunnable {
    const order = altPrio(str("ASCENDING"), str("DESCENDING"));

    const sel = alt(new ComponentChain(), new Dynamic(), new SourceFieldSymbol());

    const text = str("AS TEXT");

    const fields = plus(seq(sel, optPrio(text), optPrio(order), optPrio(text)));

    const by = seq(str("BY"), fields);

    const normal = seq(new Target(), opt(per(order, by, str("STABLE"), text)));

    const target = alt(normal, text);

    return seq(str("SORT"), target);
  }

}