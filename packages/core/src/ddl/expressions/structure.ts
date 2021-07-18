import {Expression, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLField} from "./field";
import {DDLName} from "./name";

export class Structure extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DEFINE STRUCTURE", DDLName, "{", plusPrio(DDLField), "}");
  }
}