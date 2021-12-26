import {CDSCast, CDSName} from ".";
import {alt, Expression, regex, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const qualified = seq(CDSName, star(seq(".", CDSName)));
    const input = alt(qualified, regex(/^\d+$/), CDSCast);
    const coalesce = seq("COALESCE", "(", input, ",", input, ")");
    const concat = seq("CONCAT", "(", input, ",", input, ")");
    const concat_with_space = seq("CONCAT_WITH_SPACE", "(", input, ",", input, ",", input, ")");
    const substring = seq("SUBSTRING", "(", input, ",", input, ",", input, ")");
    return alt(substring, coalesce, concat, concat_with_space);
  }
}