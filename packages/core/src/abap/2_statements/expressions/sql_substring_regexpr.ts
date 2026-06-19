import {seq, optPrio, altPrio, Expression, ver, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLRegexprPattern} from "./sql_regexpr_pattern";
import {SQLRegexprFrom} from "./sql_regexpr_from";
import {SQLRegexprOccurrence} from "./sql_regexpr_occurrence";
import {SQLRegexprGroup} from "./sql_regexpr_group";

export class SQLSubstringRegexpr extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio("SUBSTRING_REGEXPR", "SUBSTR_REGEXPR");
    return ver(Version.v758, seq(
      name,
      tok(ParenLeftW),
      SQLRegexprPattern,
      optPrio(SQLRegexprFrom),
      optPrio(SQLRegexprOccurrence),
      optPrio(SQLRegexprGroup),
      tok(WParenRightW),
    ));
  }
}
