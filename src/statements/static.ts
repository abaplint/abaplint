import {Statement} from "./statement";
import {str, seq, opt, alt, IRunnable} from "../combi";
import {Value, Type, FieldLength, NamespaceSimpleName, TypeTable} from "../expressions";

export class Static extends Statement {

  public static get_matcher(): IRunnable {
    let type = seq(opt(new FieldLength()), new Type());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new NamespaceSimpleName(),
                  opt(alt(type, new TypeTable())),
                  opt(new Value()));

    return ret;
  }

}