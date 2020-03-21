import {alt, Expression, IStatementRunnable} from "../combi";
import {Constant, FieldChain} from ".";

export class FunctionName extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new Constant(), new FieldChain());
  }
}