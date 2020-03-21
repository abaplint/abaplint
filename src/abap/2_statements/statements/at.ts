import {IStatement} from "./_statement";
import {str, seq, alt, opt, regex, altPrio} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class At implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = alt(seq(new FieldSub(), opt(new FieldOffset()), opt(new FieldLength())),
                      new Dynamic(),
                      new SourceFieldSymbol());

    const atNew = seq(str("NEW"), field);
    const atEnd = seq(str("END OF"), field);
    const group = regex(/^\w+$/);

    const ret = seq(str("AT"), altPrio(str("FIRST"), str("LAST"), atNew, atEnd, group));

    return ret;
  }

}