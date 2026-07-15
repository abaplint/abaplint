import {CDSAs, CDSParametersSelect} from ".";
import {Expression, opt, altPrio, regex, seq, stopBefore1} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

const KEYWORDS = ["AS", "ON", "WHERE", "WITH", "UNION", "GROUP", "HAVING",
  "AND", "OR", "BETWEEN", "LIKE", "IN", "EXISTS",
  "WHEN", "THEN", "ELSE", "END", "CASE", "CAST"];

export class CDSRelation extends Expression {
  public getRunnable(): IStatementRunnable {
    const word = regex(/^[\w_]+$/);
    const slashName = seq("/", regex(/^[\w]+$/), "/", stopBefore1(...KEYWORDS), regex(/^[\w_]+$/));
    const name = altPrio(slashName, word);
    return seq(name, opt(CDSParametersSelect), opt(CDSAs));
  }
}
