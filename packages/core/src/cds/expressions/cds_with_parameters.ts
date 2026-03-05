import {CDSAnnotation, CDSName, CDSType} from ".";
import {Expression, seq, star, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSWithParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = seq(starPrio(CDSAnnotation), CDSName, ":", CDSType, starPrio(CDSAnnotation));
    return seq("WITH PARAMETERS", param, star(seq(",", param)));
  }
}