import {Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLName} from "./ddl_name";

export class DDLInclude extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("INCLUDE", DDLName, ";");
  }
}