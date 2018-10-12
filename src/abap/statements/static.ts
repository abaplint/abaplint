import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, IRunnable} from "../combi";
import {Value, Type, FieldLength, NamespaceSimpleName, TypeTable} from "../expressions";
import {Version} from "../../version";

export class Static extends Statement {

  public get_matcher(): IRunnable {
    let type = seq(opt(new FieldLength()), new Type());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  new NamespaceSimpleName(),
                  opt(alt(type, new TypeTable())),
                  opt(new Value()));

    return verNot(Version.Cloud, ret);
  }

}