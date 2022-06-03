import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class AssociationName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\\_[\w]+$/);
  }
}