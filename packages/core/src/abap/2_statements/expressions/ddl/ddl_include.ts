import {Expression, seq} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";
import {DDLName} from "./ddl_name";

export class DDLInclude extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("INCLUDE", DDLName, ";");
  }
}