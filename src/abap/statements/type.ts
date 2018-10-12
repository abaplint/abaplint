import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {NamespaceSimpleName, FieldLength, Type as eType, TypeTable} from "../expressions";

export class Type extends Statement {

  public getMatcher(): IRunnable {
    let def = seq(new NamespaceSimpleName(),
                  opt(new FieldLength()),
                  opt(alt(new eType(), new TypeTable())));

    let ret = seq(alt(str("TYPE"), str("TYPES")), def);

    return ret;
  }

}