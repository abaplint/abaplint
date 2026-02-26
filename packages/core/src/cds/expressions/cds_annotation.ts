import {CDSAnnotationObject, CDSAnnotationSimple} from ".";
import {alt, Expression, opt, regex, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAnnotationArray} from "./cds_annotation_array";

export class CDSAnnotation extends Expression {
  public getRunnable(): IStatementRunnable {
    const nameWithSlash = seq(regex(/^\w+$/), star(seq("/", regex(/^\w+$/))));

    // Support both "@Name" (single token), "@ Name" (two tokens), and "@< Name" (inline backward annotation)
    const annotationStart = alt(regex(/^@\w+$/), seq("@", regex(/^\w+$/)), seq("@", "<", regex(/^\w+$/)));

    return seq(annotationStart, star(seq(".", nameWithSlash)),
               opt(seq(":", alt(CDSAnnotationArray, CDSAnnotationObject, CDSAnnotationSimple))));
  }
}