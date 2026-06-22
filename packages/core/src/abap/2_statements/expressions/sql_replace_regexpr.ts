import {seq, optPrio, altPrio, Expression, ver, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {SimpleSource3} from "./simple_source3";
import {Source} from "./source";
import {SQLFunctionInput} from "./sql_function_input";
import {SQLRegexprPattern} from "./sql_regexpr_pattern";
import {SQLRegexprFrom} from "./sql_regexpr_from";
import {SQLRegexprOccurrence} from "./sql_regexpr_occurrence";

export class SQLReplaceRegexpr extends Expression {
  public getRunnable(): IStatementRunnable {
    const hostParen = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const hostVar = seq(tok(WAt), altPrio(SimpleSource3, hostParen));
    const withClause = seq("WITH", altPrio(hostVar, SQLFunctionInput));
    return ver(Release.v757, seq(
      "REPLACE_REGEXPR",
      tok(ParenLeftW),
      SQLRegexprPattern,
      optPrio(withClause),
      optPrio(SQLRegexprFrom),
      optPrio(SQLRegexprOccurrence),
      tok(WParenRightW),
    ));
  }
}
