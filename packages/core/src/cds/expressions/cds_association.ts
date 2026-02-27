import {CDSCondition, CDSRelation} from ".";
import {altPrio, Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    // Text cardinality: "to exact one", "to one", "to many" — no brackets
    const textCardinality = seq(opt("EXACT"), altPrio("ONE", "MANY"));
    return seq("ASSOCIATION", opt(CDSCardinality), "TO", opt(altPrio(textCardinality, "PARENT")), CDSRelation, "ON", CDSCondition,
               opt(seq("WITH", "DEFAULT", "FILTER", CDSCondition)));
  }
}