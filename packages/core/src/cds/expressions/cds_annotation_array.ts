import {CDSAnnotationObject} from ".";
import {alt, Expression, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotationSimple} from "./cds_annotation_simple";

export class CDSAnnotationArray extends Expression {
  public getRunnable(): IStatementRunnable {

    const value = alt(CDSAnnotationSimple, CDSAnnotationObject, CDSAnnotationArray);
    const valueList = seq("[", value, star(seq(",", value)), "]");

    return valueList;
  }
}