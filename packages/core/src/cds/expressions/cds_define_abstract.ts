import {CDSAnnotation, CDSAssociation, CDSComposition, CDSType, CDSWithParameters} from ".";
import {Expression, str, seq, star, opt, optPrio, plus, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";

export class CDSDefineAbstract extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(star(CDSAnnotation), optPrio(str("KEY")), CDSName, ":", CDSType, ";");
    const compsiOrAssoci = seq(star(CDSAnnotation), CDSName, ":", alt(CDSComposition, CDSAssociation), ";");

    return seq(star(CDSAnnotation), opt("DEFINE"), opt("ROOT"), "ABSTRACT", "ENTITY", CDSName,
               opt(CDSWithParameters),
               str("{"),
               plus(alt(field, compsiOrAssoci)),
               str("}"), opt(";"));
  }
}
