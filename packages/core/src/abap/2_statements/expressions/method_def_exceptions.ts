import {seq, Expression, plusPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {NamespaceSimpleName} from ".";

export class MethodDefExceptions extends Expression {
  public getRunnable(): IStatementRunnable {
    const exceptions = seq("EXCEPTIONS", plusPrio(NamespaceSimpleName));

    return exceptions;
  }
}