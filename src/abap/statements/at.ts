import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IRunnable, regex} from "../combi";
import {FieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {Version} from "../../version";

export class At extends Statement {

  public getMatcher(): IRunnable {
    const field = alt(seq(new FieldSub(), opt(new FieldOffset()), opt(new FieldLength())),
                      new Dynamic(),
                      new FieldSymbol());

    const atNew = seq(str("NEW"), field);
    const atEnd = seq(str("END OF"), field);
    const group = regex(/^\w+$/);

    const ret = seq(str("AT"), alt(group, str("FIRST"), str("LAST"), atNew, atEnd));

    return verNot(Version.Cloud, ret);
  }

}