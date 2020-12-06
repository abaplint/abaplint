import {Expression, seqs, plusPrios} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {MethodName} from "./method_name";

export class AbstractMethods extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("ABSTRACT METHODS", plusPrios(MethodName));
  }
}