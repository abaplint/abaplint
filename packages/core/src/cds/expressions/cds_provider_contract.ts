import {Expression, seq, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSProviderContract extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("PROVIDER CONTRACT",
               alt("TRANSACTIONAL_QUERY", "TRANSACTIONAL_INTERFACE", "ANALYTICAL_QUERY"));
  }
}