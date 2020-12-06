import {alts, Expression, seqs, str, altPrio, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class Color extends Expression {
  public getRunnable(): IStatementRunnable {
    const eq = seqs("=", Source);
    const integers = alts("1", "2", "3", "4", "5", "6", "7");
    const texts = alts("COL_BACKGROUND",
                       "COL_HEADING",
                       "COL_NORMAL",
                       "COL_TOTAL",
                       "COL_KEY",
                       "COL_POSITIVE",
                       "COL_NEGATIVE",
                       "COL_GROUP");
    const value = alts(eq, altPrio(str("ON"), str("OFF"), alts(integers, texts)));
    const toggle = alts("ON", "OFF");

    return seqs("COLOR", value, opt(toggle));
  }
}