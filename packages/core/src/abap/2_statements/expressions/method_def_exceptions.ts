import {seq, Expression, plusPrio, stopBefore1} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {NamespaceSimpleName} from ".";

export class MethodDefExceptions extends Expression {
  public getRunnable(): IStatementRunnable {
    // parameter section keywords cannot be exception names
    const name = seq(stopBefore1("IMPORTING", "EXPORTING", "CHANGING", "RETURNING", "RAISING", "EXCEPTIONS"), NamespaceSimpleName);

    const exceptions = seq("EXCEPTIONS", plusPrio(name));

    return exceptions;
  }
}
