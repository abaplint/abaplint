import {seq, Expression, tok, starPrio, altPrio} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW} from "../../1_lexer/tokens/wparen_leftw";
import {WParenLeft} from "../../1_lexer/tokens/wparen_left";

export class SQLIntoList extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoList = seq(altPrio(tok(WParenLeft), tok(WParenLeftW)),
                         starPrio(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");

    return seq("INTO", intoList);
  }
}