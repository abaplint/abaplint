import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class SQLFieldName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^(?!(?:SINGLE|INTO|APPENDING|FROM)$)\w+(~\w+)?$/i);
  }
}