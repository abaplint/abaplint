import {CDSAnnotation, CDSAssociation, CDSComposition} from ".";
import {Expression, seq, star, opt, str, plus, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSType} from "./cds_type";

export class CDSDefineCustom extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(opt(str("KEY")), CDSName, ":", CDSType, ";");
    const compsiOrAssoci = seq(CDSName, ":", alt(CDSComposition, CDSAssociation), ";");

    return seq(star(CDSAnnotation), str("DEFINE"), opt(str("ROOT")), str("CUSTOM ENTITY"), CDSName, str("{"),
               plus(seq(star(CDSAnnotation), alt(field, compsiOrAssoci))),
               str("}"), opt(";"));
  }
}