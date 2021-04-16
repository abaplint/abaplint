import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFieldName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^(?!(?:SINGLE|INTO|DISTINCT|AS|WHERE|HAVING|APPENDING|UP|FROM)$)(\/\w+\/)?(\w+~(\w+|\*)|\w+)$/i);
  }
}