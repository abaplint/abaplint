import {CDSCondition, CDSRelation} from ".";
import {altPrio, Expression, seq, opt, optPrio, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    // Text cardinality: "to exact one", "to one", "to many" — no brackets
    const textCardinality = seq(opt("EXACT"), altPrio("ONE", "MANY"));
    // Numeric cardinality: any non-negative integer or * (e.g. [0..1], [1..2], [0..*])
    const cardNum = altPrio(regex(/^\d+$/), "*");
    const numericCardinality = seq("[", cardNum, optPrio(seq(".", ".", cardNum)), "]");
    // Text-based OF form: "association of one to many Target on ..." — text cardinality includes "TO"
    const ofTextForm = seq("ASSOCIATION", "OF", altPrio("ONE", "MANY"), "TO", altPrio("ONE", "MANY"), CDSRelation, "ON", CDSCondition);
    // Numeric OF form: "association of [0..1] to Target on ..."
    const ofNumericForm = seq("ASSOCIATION", "OF", numericCardinality, "TO", CDSRelation, "ON", CDSCondition);
    // "association [0..1] to Target as _Alias on condition" — standard form
    const standardForm = seq("ASSOCIATION", opt(CDSCardinality), "TO", opt(altPrio(textCardinality, "PARENT")), CDSRelation, "ON", CDSCondition,
                             opt(seq("WITH", "DEFAULT", "FILTER", CDSCondition)));
    return altPrio(ofTextForm, ofNumericForm, standardForm);
  }
}
