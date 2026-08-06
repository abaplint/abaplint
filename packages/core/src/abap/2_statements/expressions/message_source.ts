import {seq, tok, Expression, opt, altPrio} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {MessageTypeAndNumber, MessageClass, MessageNumber, SimpleSource3} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MessageSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const msgid = seq(tok(ParenLeft), MessageClass, tok(ParenRightW));
    const simple = seq(MessageTypeAndNumber, opt(msgid));

    const mess1 = seq("ID", SimpleSource3, "TYPE", SimpleSource3, "NUMBER", altPrio(MessageNumber, SimpleSource3));

    return altPrio(simple, mess1);
  }
}