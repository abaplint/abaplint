import {alt, Expression, seq, altPrio, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class Color extends Expression {
  public getRunnable(): IStatementRunnable {
    const eq = seq("=", Source);
    const integers = altPrio("1", "2", "3", "4", "5", "6", "7");
    const texts = altPrio("COL_BACKGROUND",
                          "COL_HEADING",
                          "COL_NORMAL",
                          "COL_TOTAL",
                          "COL_KEY",
                          "COL_POSITIVE",
                          "COL_NEGATIVE",
                          "COL_GROUP");
    const value = alt(eq, altPrio("ON", "OFF", altPrio(integers, texts)));
    const toggle = altPrio("ON", "OFF");

    return seq("COLOR", value, opt(toggle));
  }
}