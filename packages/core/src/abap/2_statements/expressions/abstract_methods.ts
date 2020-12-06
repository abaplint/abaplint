import {Expression, seq, plusPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {MethodName} from "./method_name";

export class AbstractMethods extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("ABSTRACT METHODS", plusPrios(MethodName));
  }
}