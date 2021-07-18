import {Expression, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLStructureField} from "./ddl_structure_field";
import {DDLName} from "./ddl_name";

export class DDLStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DEFINE STRUCTURE", DDLName, "{", plusPrio(DDLStructureField), "}");
  }
}