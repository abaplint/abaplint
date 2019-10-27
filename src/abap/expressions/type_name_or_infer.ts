import {alt, str, Expression, IStatementRunnable} from "../combi";
import {TypeName} from "./type_name";

export class TypeNameOrInfer extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(new TypeName(), str("#"));
  }
}