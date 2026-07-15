import {Expression, optPrio, regex, seq, altPrio, stopBefore1} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

const KEYWORDS = ["AS", "ON", "WHERE", "WITH", "UNION", "GROUP", "HAVING",
  "AND", "OR", "BETWEEN", "LIKE", "IN", "EXISTS",
  "WHEN", "THEN", "ELSE", "END", "CASE", "CAST"];

export class CDSName extends Expression {
  public getRunnable(): IStatementRunnable {
    const word = regex(/^\$?#?[\w_]+$/);
    const slashName = seq("/", regex(/^[\w]+$/), "/", stopBefore1(...KEYWORDS), regex(/^[\w_]+$/));
    return altPrio(
      regex(/^"(?:[^"]|"")*"$/),
      seq(optPrio(":"), slashName),
      seq(optPrio(":"), word),
    );
  }
}
