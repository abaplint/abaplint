import {CDSAnnotation, CDSAs} from ".";
import {Expression, seq, star, opt, str} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";

export class CDSExtendView extends Expression {
  public getRunnable(): IStatementRunnable {

    const namedot = seq(CDSName, opt(seq(".", CDSName)), opt(CDSAs));
    const valueNested = seq("{", namedot, star(seq(",", namedot)), "}");

    return seq(star(CDSAnnotation), str("EXTEND VIEW"), opt(str("ENTITY")), CDSName, str("WITH"), opt(CDSName),
               valueNested, opt(";"));
  }
}