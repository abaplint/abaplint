import {seq, Expression, tok, starPrio, altPrio, ver, AlsoIn} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW} from "../../1_lexer/tokens/wparen_leftw";
import {WParenLeft} from "../../1_lexer/tokens/wparen_left";
import {Release} from "../../../version";

export class SQLIntoList extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoList = seq(altPrio(tok(WParenLeft), ver(Release.v740sp02, tok(WParenLeftW), {also: AlsoIn.OpenABAP})),
                         starPrio(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");

    return seq("INTO", intoList);
  }
}