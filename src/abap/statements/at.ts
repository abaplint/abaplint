import {Statement} from "./statement";
import {verNot, str, seq, alt, IRunnable, regex} from "../combi";
import {FieldSymbol, FieldSub, Dynamic} from "../expressions";
import {Version} from "../../version";

export class At extends Statement {

  public static get_matcher(): IRunnable {
    let field = alt(new FieldSub(),
                    new Dynamic(),
                    new FieldSymbol());

    let atNew = seq(str("NEW"), field);
    let atEnd = seq(str("END OF"), field);
    let group = regex(/^\w+$/);

    let ret = seq(str("AT"), alt(group, str("FIRST"), str("LAST"), atNew, atEnd));

    return verNot(Version.Cloud, ret);
  }

}