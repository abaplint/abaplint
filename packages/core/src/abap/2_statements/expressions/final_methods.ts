import {Expression, seqs, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {MethodName} from "./method_name";

export class FinalMethods extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs("FINAL METHODS", pluss(MethodName));
  }
}