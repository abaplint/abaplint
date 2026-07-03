import {altPrio, Expression, optPrio, plusPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotation} from "../../cds/expressions";
import {DDLExtend} from "./ddl_extend";
import {DDLInclude} from "./ddl_include";
import {DDLName} from "./ddl_name";
import {DDLNamedInclude} from "./ddl_named_include";
import {DDLTableField} from "./ddl_table_field";

export class DDLAspect extends Expression {
  public getRunnable(): IStatementRunnable {
    const entry = altPrio(DDLNamedInclude, DDLInclude, DDLTableField, DDLExtend);
    return seq(
      star(CDSAnnotation),
      "DEFINE", "ASPECT", DDLName,
      "{", plusPrio(entry), "}",
      optPrio(";"),
    );
  }
}
