import {seq, alt, altPrio, optPrio, tok, Expression, regex as reg, ver} from "../combi";
import {WParenLeftW, WParenLeft, WParenRightW, ParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class SQLIndicators extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = reg(/^%?\w+$/);
    const staticForm = seq(optPrio("NOT"),
                           "NULL",
                           alt(seq("STRUCTURE", name), seq("BITFIELD", name)));
    const lparen = altPrio(tok(WParenLeftW), tok(WParenLeft));
    const rparen = altPrio(tok(WParenRightW), tok(ParenRightW));
    const dynamicForm = seq(lparen, name, rparen);
    return ver(Release.v915, seq("INDICATORS", altPrio(staticForm, dynamicForm)));
  }
}
