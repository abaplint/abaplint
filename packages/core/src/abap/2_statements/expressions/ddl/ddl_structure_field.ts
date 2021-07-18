import {Expression, seq} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";
import {DDLName} from "./ddl_name";
import {DDLType} from "./ddl_type";

export class DDLStructureField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(DDLName, ":", DDLType, ";");
  }
}