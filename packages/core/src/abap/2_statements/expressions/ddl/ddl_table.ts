import {Expression, plusPrio, seq} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";
import {DDLName} from "./ddl_name";
import {DDLTableField} from "./ddl_table_field";

export class DDLTable extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DEFINE TABLE", DDLName, "{", plusPrio(DDLTableField), "}");
  }
}