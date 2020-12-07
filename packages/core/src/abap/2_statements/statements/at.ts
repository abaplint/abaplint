import {IStatement} from "./_statement";
import {seq, alt, opt, regex, altPrio} from "../combi";
import {SourceFieldSymbol, FieldSub, Dynamic, FieldLength, FieldOffset} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class At implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = alt(seq(FieldSub, opt(FieldOffset), opt(FieldLength)),
                      Dynamic,
                      SourceFieldSymbol);

    const atNew = seq("NEW", field);
    const atEnd = seq("END OF", field);
    const group = regex(/^\w+$/);

    const ret = seq("AT", altPrio("FIRST", "LAST", atNew, atEnd, group));

    return ret;
  }

}