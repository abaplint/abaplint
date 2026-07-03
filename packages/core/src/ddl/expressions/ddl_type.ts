import {altPrio, Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSInteger} from "../../cds/expressions/cds_integer";
import {DDLName} from "./ddl_name";

export class DDLType extends Expression {
  public getRunnable(): IStatementRunnable {
    const decimals = seq(",", CDSInteger);
    const lenSpec = seq("(", CDSInteger, optPrio(decimals), ")");
    const dotted = seq(DDLName, ".", DDLName, optPrio(lenSpec));
    const plain = seq(DDLName, optPrio(lenSpec));
    return altPrio(dotted, plain);
  }
}
