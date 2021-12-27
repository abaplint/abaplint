import {CDSCondition, CDSRelation} from ".";
import {Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("ASSOCIATION", opt(CDSCardinality), "TO", opt("PARENT"), CDSRelation, "ON", CDSCondition);
  }
}