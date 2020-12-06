import {alts, seq, stars, Expression} from "../combi";
import {Constant, FieldChain, StringTemplate, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SimpleSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seq("&&", StringTemplate);

    const template = seq(StringTemplate, stars(concat));

    return alts(Constant, MethodCallChain, template, FieldChain);
  }
}