import {CDSName} from ".";
import {alt, Expression, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    const cardinality = alt("[0..1]", "[0..*]");
    return seq("ASSOCIATION", cardinality, "TO", CDSName);
  }
}