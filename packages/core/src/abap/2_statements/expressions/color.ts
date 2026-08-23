import {alt, Expression, seq, altPrio, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SimpleSource3} from "./simple_source3";

export class Color extends Expression {
  public getRunnable(): IStatementRunnable {
    const eq = seq("=", SimpleSource3);
    const integers = altPrio("1", "2", "3", "4", "5", "6", "7");
    const texts = altPrio("COL_BACKGROUND",
                          "COL_HEADING",
                          "COL_NORMAL",
                          "COL_TOTAL",
                          "COL_KEY",
                          "COL_POSITIVE",
                          "COL_NEGATIVE",
                          "COL_GROUP");
    const value = alt(eq, altPrio("ON", "OFF", "COLOR OFF", altPrio(integers, texts)));
    const toggle = altPrio("ON", "OFF");

    return seq("COLOR", opt(seq(value, opt(toggle))));
  }
}