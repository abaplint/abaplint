import {regex as reg, Expression, IStatementRunnable} from "../combi";

export class SQLFieldName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^(?!(?:SINGLE|INTO|APPENDING|UP|FROM)$)\w+(~\w+)?$/i);
  }
}