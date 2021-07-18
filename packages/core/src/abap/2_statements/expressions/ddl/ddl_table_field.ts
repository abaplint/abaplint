import {Expression, optPrio, seq} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";
import {DDLName} from "./ddl_name";
import {DDLType} from "./ddl_type";

export class DDLTableField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(optPrio("KEY"), DDLName, ":", DDLType, optPrio("NOT NULL"), ";");
  }
}