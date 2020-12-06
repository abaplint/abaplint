import {IStatement} from "./_statement";
import {seq, alts, opts, regex, altPrios} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class At implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = alts(seq(FieldSub, opts(FieldOffset), opts(FieldLength)),
                       Dynamic,
                       SourceFieldSymbol);

    const atNew = seq("NEW", field);
    const atEnd = seq("END OF", field);
    const group = regex(/^\w+$/);

    const ret = seq("AT", altPrios("FIRST", "LAST", atNew, atEnd, group));

    return ret;
  }

}