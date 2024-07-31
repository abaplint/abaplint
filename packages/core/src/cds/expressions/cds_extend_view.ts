import {CDSAnnotation} from ".";
import {Expression, seq, star, opt, str} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";

export class CDSExtendView extends Expression {
  public getRunnable(): IStatementRunnable {

    const namedot = seq(CDSName, star(seq(".", CDSName)));
    const valueNested = seq("{", namedot, star(seq(",", namedot)), "}");

    return seq(star(CDSAnnotation), str("EXTEND VIEW ENTITY"), CDSName, str("WITH"),
               valueNested, opt(";"));
  }
}