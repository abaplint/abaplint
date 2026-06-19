import {seq, optPrio, Expression, ver, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLRegexprPattern} from "./sql_regexpr_pattern";
import {SQLRegexprFrom} from "./sql_regexpr_from";

export class SQLOccurrencesRegexpr extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v757, seq(
      "OCCURRENCES_REGEXPR",
      tok(ParenLeftW),
      SQLRegexprPattern,
      optPrio(SQLRegexprFrom),
      tok(WParenRightW),
    ));
  }
}
