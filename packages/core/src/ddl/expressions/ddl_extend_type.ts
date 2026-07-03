import {altPrio, Expression, optPrio, plusPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotation} from "../../cds/expressions";
import {DDLInclude} from "./ddl_include";
import {DDLName} from "./ddl_name";
import {DDLNamedInclude} from "./ddl_named_include";
import {DDLStructureField} from "./ddl_structure_field";
import {DDLTableField} from "./ddl_table_field";

export class DDLExtendType extends Expression {
  public getRunnable(): IStatementRunnable {
    const entry = altPrio(DDLNamedInclude, DDLInclude, DDLTableField, DDLStructureField);
    return seq(
      star(CDSAnnotation),
      "EXTEND", "TYPE", DDLName, "WITH", DDLName,
      "{", plusPrio(entry), "}",
      optPrio(";"),
    );
  }
}
