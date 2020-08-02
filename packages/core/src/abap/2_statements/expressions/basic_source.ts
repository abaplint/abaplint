import {alt, str, seq, star, Expression, optPrio} from "../combi";
import {Constant, FieldChain, StringTemplate} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {TableBody} from "./table_body";

/** Reduced version of SimpleSource, omits MethodCallChains. */
export class BasicSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq(str("&&"), new StringTemplate());
    const template = seq(new StringTemplate(), star(concat));

    return alt(new Constant(), template, seq(new FieldChain(), optPrio(new TableBody())));
  }
}