import {altPrio, str, Expression, IStatementRunnable} from "../combi";
import {TypeName} from ".";

export class TypeNameOrInfer extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(str("#"), new TypeName());
  }
}