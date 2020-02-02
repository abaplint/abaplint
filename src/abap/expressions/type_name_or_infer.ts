import {altPrio, str, Expression, IStatementRunnable} from "../combi";
import {TypeName} from "./type_name";

export class TypeNameOrInfer extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(str("#"), new TypeName());
  }
}