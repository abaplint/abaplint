import {Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLName} from "./name";
import {DDLType} from "./type";

export class DDLField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(DDLName, ":", DDLType, ";");
  }
}