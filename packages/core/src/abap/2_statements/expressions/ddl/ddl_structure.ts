import {altPrio, Expression, plusPrio, seq} from "../../combi";
import {IStatementRunnable} from "../../statement_runnable";
import {DDLStructureField} from "./ddl_structure_field";
import {DDLName} from "./ddl_name";
import {DDLInclude} from "./ddl_include";

export class DDLStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("DEFINE STRUCTURE", DDLName, "{", plusPrio(altPrio(DDLStructureField, DDLInclude)), "}");
  }
}