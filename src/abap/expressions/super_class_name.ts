import {Expression, IStatementRunnable} from "../combi";
import {ClassName} from "./";

export class SuperClassName extends Expression {
  public getRunnable(): IStatementRunnable {
    return new ClassName();
  }
}