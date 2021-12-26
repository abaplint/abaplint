import {CDSAnnotation, CDSCase, CDSName, CDSParameters} from ".";
import {alt, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation), optPrio("KEY"), alt(seq(CDSName, opt(CDSParameters), opt(seq(".", CDSName))), CDSCast, CDSCase), optPrio(CDSAs));
  }
}