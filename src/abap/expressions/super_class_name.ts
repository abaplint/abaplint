import {Expression, IStatementRunnable} from "../combi";
import {ClassName} from "./class_name";

export class SuperClassName extends Expression {
  public getRunnable(): IStatementRunnable {
    return new ClassName();
  }
}