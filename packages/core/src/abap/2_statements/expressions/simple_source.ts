import {alt, seqs, star, Expression} from "../combi";
import {Constant, FieldChain, StringTemplate, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SimpleSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const concat = seqs("&&", StringTemplate);

    const template = seqs(StringTemplate, star(concat));

    return alt(new Constant(), new MethodCallChain(), template, new FieldChain());
  }
}