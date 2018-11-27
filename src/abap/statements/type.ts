import {Statement} from "./_statement";
import {str, seq, alt, per, opt, IStatementRunnable} from "../combi";
import {NamespaceSimpleName, FieldLength, Type as eType, TypeTable, Decimals, Length} from "../expressions";

export class Type extends Statement {

  public getMatcher(): IStatementRunnable {
    const simple = per(new eType(), new Decimals(), new Length());

    const def = seq(new NamespaceSimpleName(),
                    opt(new FieldLength()),
                    opt(alt(simple, new TypeTable())));

    const ret = seq(alt(str("TYPE"), str("TYPES")), def);

    return ret;
  }

}