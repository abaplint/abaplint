import {Expression, seq, str, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {MethodName} from "./method_name";

export class AbstractMethods extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("ABSTRACT METHODS"), plus(new MethodName()));
  }
}