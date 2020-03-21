import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class SQLAliasField extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^\w+~\w+?$/);
  }
}