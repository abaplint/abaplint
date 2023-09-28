import {seq, Expression, optPrio} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLIntoStructure extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoSimple = seq(optPrio("CORRESPONDING FIELDS OF"), SQLTarget);

    return seq("INTO", intoSimple);
  }
}