import {alt, seq, star, Expression} from "../combi";
import {Constant, FieldChain, StringTemplate, MethodCallChain, TextElement} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SimpleSource1 extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq("&&", StringTemplate);

    const template = seq(StringTemplate, star(concat));

    return alt(Constant, TextElement, MethodCallChain, template, FieldChain);
  }
}