import {Version} from "../../../version";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio, optPrio, plus, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunctionInput} from "./sql_function_input";
import {SQLSource} from "./sql_source";
import {SQLOrderBy} from "./sql_order_by";

const lparen = tok(ParenLeftW);
const rparen = altPrio(tok(WParenRightW), tok(WParenRight));

export class SQLOver extends Expression {
  public getRunnable(): IStatementRunnable {
    const partitionBy = seq("PARTITION", "BY", plus(seq(SQLFunctionInput, opt(","))));

    const unboundedPreceding = seq("UNBOUNDED", "PRECEDING");
    const unboundedFollowing = seq("UNBOUNDED", "FOLLOWING");
    const currentRow = seq("CURRENT", "ROW");
    const numBound = seq(SQLSource, altPrio("PRECEDING", "FOLLOWING"));
    const bound = altPrio(unboundedPreceding, unboundedFollowing, currentRow, numBound);
    const windowFrameSpec = ver(Version.v757, seq("ROWS", "BETWEEN", bound, "AND", bound));

    return ver(Version.v757,
               seq("OVER", lparen,
                   optPrio(partitionBy),
                   optPrio(SQLOrderBy),
                   optPrio(windowFrameSpec),
                   rparen));
  }
}
