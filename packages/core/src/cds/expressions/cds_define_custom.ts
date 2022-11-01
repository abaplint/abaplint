import {CDSAnnotation} from ".";
import {Expression, seq, star, opt, str, plus} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSType} from "./cds_type";

export class CDSDefineCustom extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(star(CDSAnnotation), opt(str("KEY")), CDSName, ":", CDSType, ";");

    return seq(star(CDSAnnotation), str("DEFINE ROOT CUSTOM ENTITY"), CDSName, str("{"),
               plus(field),
               str("}"), opt(";"));
  }
}