import {Statement} from "./_statement";
import {str, seq, alt, per, opt, IRunnable} from "../combi";
import {NamespaceSimpleName, FieldLength, Type as eType, TypeTable, Decimals, Length} from "../expressions";

export class Type extends Statement {

  public getMatcher(): IRunnable {
    let simple = per(new eType(), new Decimals(), new Length());

    let def = seq(new NamespaceSimpleName(),
                  opt(new FieldLength()),
                  opt(alt(simple, new TypeTable())));

    let ret = seq(alt(str("TYPE"), str("TYPES")), def);

    return ret;
  }

}