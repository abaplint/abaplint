import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IStatementRunnable, regex, altPrio} from "../combi";
import {FieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {Version} from "../../version";

export class At extends Statement {

  public getMatcher(): IStatementRunnable {
    const field = alt(seq(new FieldSub(), opt(new FieldOffset()), opt(new FieldLength())),
                      new Dynamic(),
                      new FieldSymbol());

    const atNew = seq(str("NEW"), field);
    const atEnd = seq(str("END OF"), field);
    const group = regex(/^\w+$/);

    const ret = seq(str("AT"), altPrio(str("FIRST"), str("LAST"), atNew, atEnd, group));

    return verNot(Version.Cloud, ret);
  }

}