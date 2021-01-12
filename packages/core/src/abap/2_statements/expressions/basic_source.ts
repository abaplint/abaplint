import {seq, star, Expression, altPrio} from "../combi";
import {Constant, FieldChain, StringTemplate, TextElement} from ".";
import {IStatementRunnable} from "../statement_runnable";

// BasicSource vs SimpleSource vs ConstantOrFieldSource is a mess...

/** Reduced version of SimpleSource, omits MethodCallChains. */
export class BasicSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq("&&", StringTemplate);
    const template = seq(StringTemplate, star(concat));

    return altPrio(Constant, TextElement, template, FieldChain);
  }
}