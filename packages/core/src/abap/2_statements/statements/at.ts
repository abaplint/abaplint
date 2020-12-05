import {IStatement} from "./_statement";
import {str, seqs, alt, opt, regex, altPrio} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class At implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = alt(seqs(FieldSub, opt(new FieldOffset()), opt(new FieldLength())),
                      new Dynamic(),
                      new SourceFieldSymbol());

    const atNew = seqs("NEW", field);
    const atEnd = seqs("END OF", field);
    const group = regex(/^\w+$/);

    const ret = seqs("AT", altPrio(str("FIRST"), str("LAST"), atNew, atEnd, group));

    return ret;
  }

}