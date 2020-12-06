import {Expression, seq, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {MethodName} from "./method_name";

export class FinalMethods extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("FINAL METHODS", plus(MethodName));
  }
}