import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {NamespaceSimpleName, FieldLength, Type, Value} from "../expressions";

export class Constant extends Statement {

  public getMatcher(): IRunnable {
    let def = seq(new NamespaceSimpleName(), opt(new FieldLength()), opt(new Type()), new Value());

    let ret = seq(alt(str("CONSTANT"), str("CONSTANTS")), def);

    return ret;
  }

}