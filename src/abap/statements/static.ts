import {Statement} from "./_statement";
import {verNot, str, seq, opt, per, alt, IRunnable} from "../combi";
import {Value, Type, FieldLength, NamespaceSimpleName, TypeTable, Length} from "../expressions";
import {Version} from "../../version";

export class Static extends Statement {

  public getMatcher(): IRunnable {
    let p = opt(per(new Type(), new Value(), new Length()));

    let type = seq(opt(new FieldLength()), p);

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new NamespaceSimpleName(),
                  alt(type, new TypeTable()));

    return verNot(Version.Cloud, ret);
  }

}