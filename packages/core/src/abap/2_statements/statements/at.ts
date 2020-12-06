import {IStatement} from "./_statement";
import {str, seqs, alts, opt, regex, altPrio} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class At implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = alts(seqs(FieldSub, opt(new FieldOffset()), opt(new FieldLength())),
                       Dynamic,
                       SourceFieldSymbol);

    const atNew = seqs("NEW", field);
    const atEnd = seqs("END OF", field);
    const group = regex(/^\w+$/);

    const ret = seqs("AT", altPrio(str("FIRST"), str("LAST"), atNew, atEnd, group));

    return ret;
  }

}