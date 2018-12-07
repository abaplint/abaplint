import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class DatabaseTable extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\*?(\/\w+\/)?\w+$/);
  }
}