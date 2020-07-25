import {alt, Expression, seq, str, altPrio, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";

export class Color extends Expression {
  public getRunnable(): IStatementRunnable {
    const eq = seq(str("="), new Source());
    const integers = alt(str("1"), str("2"), str("3"), str("4"), str("5"), str("6"), str("7"));
    const texts = alt(str("COL_BACKGROUND"),
                      str("COL_HEADING"),
                      str("COL_NORMAL"),
                      str("COL_TOTAL"),
                      str("COL_KEY"),
                      str("COL_POSITIVE"),
                      str("COL_NEGATIVE"),
                      str("COL_GROUP"));
    const value = alt(eq, altPrio(str("ON"), str("OFF"), alt(integers, texts)));
    const toggle = alt(str("ON"), str("OFF"));

    return seq(str("COLOR"), value, opt(toggle));
  }
}