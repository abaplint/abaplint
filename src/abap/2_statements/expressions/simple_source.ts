import {alt, str, seq, star, Expression} from "../combi";
import {Constant, FieldChain, StringTemplate, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SimpleSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq(str("&&"), new StringTemplate());

    const template = seq(new StringTemplate(), star(concat));

    return alt(new Constant(), new MethodCallChain(), template, new FieldChain());
  }
}