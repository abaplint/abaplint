import {Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotation} from "../../cds/expressions";
import {DDLName} from "./ddl_name";
import {DDLType} from "./ddl_type";

export class DDLStructureField extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation), DDLName, ":", DDLType, optPrio("NOT NULL"), ";");
  }
}
