import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IRunnable, regex} from "../combi";
import {FieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {Version} from "../../version";

export class At extends Statement {

  public getMatcher(): IRunnable {
    let field = alt(seq(new FieldSub(), opt(new FieldOffset()), opt(new FieldLength())),
                    new Dynamic(),
                    new FieldSymbol());

    let atNew = seq(str("NEW"), field);
    let atEnd = seq(str("END OF"), field);
    let group = regex(/^\w+$/);

    let ret = seq(str("AT"), alt(group, str("FIRST"), str("LAST"), atNew, atEnd));

    return verNot(Version.Cloud, ret);
  }

}