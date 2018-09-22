import {Statement} from "./statement";
import {str, seq, alt, opt, IRunnable} from "../combi";
import {NamespaceSimpleName, FieldLength, Type, Value} from "../expressions";

export class Constant extends Statement {

  public static get_matcher(): IRunnable {
    let def = seq(new NamespaceSimpleName(), opt(new FieldLength()), opt(new Type()), new Value());

    let beginEnd = seq(alt(str("BEGIN"), str("END")), str("OF"), new NamespaceSimpleName());

    let ret = seq(alt(str("CONSTANT"), str("CONSTANTS")), alt(def, beginEnd));

    return ret;
  }

}