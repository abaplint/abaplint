import {seq, star, Expression, altPrio} from "../combi";
import {Constant, FieldChain, StringTemplate, TextElement} from ".";
import {IStatementRunnable} from "../statement_runnable";

/** Reduced version of SimpleSource, omits MethodCallChains. */
export class SimpleSource2 extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq("&&", StringTemplate);
    const template = seq(StringTemplate, star(concat));

    return altPrio(Constant, TextElement, template, FieldChain);
  }
}