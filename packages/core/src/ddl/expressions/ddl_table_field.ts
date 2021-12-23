import {Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLName} from "./ddl_name";
import {DDLType} from "./ddl_type";

export class DDLTableField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(optPrio("KEY"), DDLName, ":", DDLType, optPrio("NOT NULL"), ";");
  }
}