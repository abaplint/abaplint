import {CDSName} from ".";
import {alt, Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotationSimple} from "./cds_annotation_simple";

export class CDSAnnotationObject extends Expression {
  public getRunnable(): IStatementRunnable {

    const value = alt(CDSAnnotationObject, CDSAnnotationSimple);
    const namedot = seq(CDSName, star(seq(".", CDSName)));
    const valueNested = seq("{", namedot, ":", value, star(seq(",", namedot, ":", value)), "}");

    return valueNested;
  }
}