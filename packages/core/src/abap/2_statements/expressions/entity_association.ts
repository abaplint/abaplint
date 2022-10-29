import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class EntityAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^[\w]+\\_[\w]+$/);
  }
}