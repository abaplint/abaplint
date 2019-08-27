import {Statement} from "./_statement";
import {str, seq, opt, per, alt, IStatementRunnable} from "../combi";
import {Value, Type, FieldLength, NamespaceSimpleName, TypeTable, Length} from "../expressions";

export class Static extends Statement {

  public getMatcher(): IStatementRunnable {
    const p = opt(per(new Type(), new Value(), new Length()));

    const type = seq(opt(new FieldLength()), p);

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    new NamespaceSimpleName(),
                    alt(type, new TypeTable()));

    return ret;
  }

}