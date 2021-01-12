import {alt, seq, star, Expression} from "../combi";
import {Constant, FieldChain, StringTemplate, MethodCallChain, TextElement} from ".";
import {IStatementRunnable} from "../statement_runnable";

// BasicSource vs SimpleSource vs ConstantOrFieldSource is a mess...

export class SimpleSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq("&&", StringTemplate);

    const template = seq(StringTemplate, star(concat));

    return alt(Constant, TextElement, MethodCallChain, template, FieldChain);
  }
}