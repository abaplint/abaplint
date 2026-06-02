import {Version} from "../../../version";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio, optPrio, plus, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunctionInput} from "./sql_function_input";
import {SQLSource} from "./sql_source";
import {SQLOrderBy} from "./sql_order_by";

const lparen = tok(ParenLeftW);
const rparen = altPrio(tok(WParenRightW), tok(WParenRight));

class SQLWindowFrameSpec extends Expression {
  public getRunnable(): IStatementRunnable {
    const unboundedPreceding = seq("UNBOUNDED", "PRECEDING");
    const unboundedFollowing = seq("UNBOUNDED", "FOLLOWING");
    const currentRow = seq("CURRENT", "ROW");
    const numBound = seq(SQLSource, altPrio("PRECEDING", "FOLLOWING"));
    const bound = altPrio(unboundedPreceding, unboundedFollowing, currentRow, numBound);
    return ver(Version.v757, seq("ROWS", "BETWEEN", bound, "AND", bound));
  }
}

class SQLPartitionBy extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("PARTITION", "BY", plus(seq(SQLFunctionInput, opt(","))));
  }
}

export class SQLOver extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757,
               seq("OVER", lparen,
                   optPrio(SQLPartitionBy),
                   optPrio(SQLOrderBy),
                   optPrio(SQLWindowFrameSpec),
                   rparen));
  }
}
