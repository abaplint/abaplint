import {CDSAs, CDSName} from ".";
import {Expression, seq, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSCardinality} from "./cds_cardinality";

export class CDSComposition extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("COMPOSITION", opt(CDSCardinality), "OF", CDSName, opt(CDSAs));
  }
}