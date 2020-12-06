import {alts, Expression, seq, altPrios, opts} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class Color extends Expression {
  public getRunnable(): IStatementRunnable {
    const eq = seq("=", Source);
    const integers = alts("1", "2", "3", "4", "5", "6", "7");
    const texts = alts("COL_BACKGROUND",
                       "COL_HEADING",
                       "COL_NORMAL",
                       "COL_TOTAL",
                       "COL_KEY",
                       "COL_POSITIVE",
                       "COL_NEGATIVE",
                       "COL_GROUP");
    const value = alts(eq, altPrios("ON", "OFF", alts(integers, texts)));
    const toggle = alts("ON", "OFF");

    return seq("COLOR", value, opts(toggle));
  }
}