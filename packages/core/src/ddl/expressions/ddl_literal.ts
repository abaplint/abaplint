import {altPrio, Expression, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "../../cds/expressions/cds_integer";

export class DDLCardinalityValue extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(CDSInteger, "*");
  }
}

export class DDLStringLiteral extends Expression {
  public getRunnable(): IStatementRunnable {
    return regex(/^'[^']*'$/);
  }
}
