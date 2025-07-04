import {CDSAnnotation, CDSComposition} from ".";
import {Expression, seq, star, opt, str, plus, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSType} from "./cds_type";

export class CDSDefineCustom extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(star(CDSAnnotation), opt(str("KEY")), CDSName, ":", CDSType, ";");
    const composition = seq(star(CDSAnnotation), CDSName, ":", CDSComposition, ";");

    return seq(star(CDSAnnotation), str("DEFINE"), opt(str("ROOT")), str("CUSTOM ENTITY"), CDSName, str("{"),
               plus(alt(field, composition)),
               str("}"), opt(";"));
  }
}