import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, IRunnable} from "../combi";
import {Value, Type, FieldLength, NamespaceSimpleName, TypeTable} from "../expressions";
import {Version} from "../../version";

export class Static extends Statement {

  public getMatcher(): IRunnable {
    let type = seq(opt(new FieldLength()), opt(new Type()));

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new NamespaceSimpleName(),
                  alt(type, new TypeTable()),
                  opt(new Value()));

    return verNot(Version.Cloud, ret);
  }

}