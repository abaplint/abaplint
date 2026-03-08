import {CDSAnnotationArray, CDSName} from ".";
import {alt, Expression, seq, star, optPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotationSimple} from "./cds_annotation_simple";

export class CDSAnnotationObject extends Expression {
  public getRunnable(): IStatementRunnable {

    const value = seq(":", alt(CDSAnnotationObject, CDSAnnotationArray, CDSAnnotationSimple));
    const namedot = seq(CDSName, star(seq(".", CDSName)));
    const valueNested = seq("{", namedot, optPrio(value), star(seq(",", namedot, optPrio(value))), "}");

    return valueNested;
  }
}