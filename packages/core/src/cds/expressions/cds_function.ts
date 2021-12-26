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
    const dats_is_valid = seq("DATS_IS_VALID", "(", input, ")");
    const dats_days_between = seq("DATS_DAYS_BETWEEN", "(", input, ",", input, ")");
    const dats_add_days = seq("DATS_ADD_DAYS", "(", input, ",", input, ",", input, ")");
    const dats_add_months = seq("DATS_ADD_MONTHS", "(", input, ",", input, ",", input, ")");

    return alt(substring, coalesce, concat, concat_with_space, dats_is_valid, dats_days_between, dats_add_days, dats_add_months);
  }
}