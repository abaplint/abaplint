import {seq, Expression, tok, starPrio, altPrio, ver} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW} from "../../1_lexer/tokens/wparen_leftw";
import {WParenLeft} from "../../1_lexer/tokens/wparen_left";
import {Version} from "../../../version";

export class SQLIntoList extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoList = seq(altPrio(tok(WParenLeft), ver(Version.v740sp02, tok(WParenLeftW), Version.OpenABAP)),
                         starPrio(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");

    return seq("INTO", intoList);
  }
}