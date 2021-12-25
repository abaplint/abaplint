import {CDSName} from ".";
import {alt, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const input = alt(CDSName, regex(/^\d+$/));
    const substring = seq("SUBSTRING", "(", input, ",", input, ",", input, ")");
    const coalesce = seq("COALESCE", "(", input, ",", input, ")");
    return alt(substring, coalesce);
  }
}