import {seq, stars, Expression, altPrio} from "../combi";
import {Constant, FieldChain, StringTemplate} from ".";
import {IStatementRunnable} from "../statement_runnable";

/** Reduced version of SimpleSource, omits MethodCallChains. */
export class BasicSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq("&&", StringTemplate);
    const template = seq(StringTemplate, stars(concat));

    return altPrio(Constant, template, FieldChain);
  }
}