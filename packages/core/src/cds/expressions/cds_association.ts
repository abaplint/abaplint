import {CDSCondition, CDSRelation} from ".";
import {altPrio, Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    // Text cardinality: "to exact one", "to one", "to many" — no brackets
    const textCardinality = seq(opt("EXACT"), altPrio("ONE", "MANY"));
    // "association of one to many Target as _Alias on condition" — OF + cardinality form
    const ofForm = seq("ASSOCIATION", "OF", CDSCardinality, "TO", CDSRelation, "ON", CDSCondition);
    // "association [0..1] to Target as _Alias on condition" — standard form
    const standardForm = seq("ASSOCIATION", opt(CDSCardinality), "TO", opt(altPrio(textCardinality, "PARENT")), CDSRelation, "ON", CDSCondition,
               opt(seq("WITH", "DEFAULT", "FILTER", CDSCondition)));
    return altPrio(ofForm, standardForm);
  }
}
