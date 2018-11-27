import {Statement} from "./_statement";
import {str, seq, alt, per, opt, plus, optPrio, IStatementRunnable} from "../combi";
import {FieldSymbol, Target, Dynamic, FieldChain} from "../expressions";

export class Sort extends Statement {

  public getMatcher(): IStatementRunnable {
    const order = alt(str("ASCENDING"), str("DESCENDING"));

    const sel = alt(new FieldChain(),
                    new FieldSymbol(),
                    new Dynamic());

    const fields = plus(seq(sel, optPrio(order)));

    const by = seq(str("BY"), fields);

    const normal = seq(new Target(), opt(per(order, by, str("STABLE"), str("AS TEXT"))));

    const target = alt(normal, str("AS TEXT"));

    return seq(str("SORT"), target);
  }

}