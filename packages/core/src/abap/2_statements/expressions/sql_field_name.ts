import {regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFieldName extends Expression {
  public getRunnable(): IStatementRunnable {
    return reg(/^(?!(?:FROM|INTO|HAVING|FOR|DISTINCT|UNION|INTERSECT|EXCEPT|NOT|WHEN|CASE|AS|APPENDING|WHERE|CONNECTION|EXISTS|INSERT|MODIFY)$)(\/\w+\/)?(\*?\w+~(\/\w+\/)?(\w+|\*)|\w+)$/i);
  }
}