import {seq, tok, Expression, opt, altPrio} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {MessageTypeAndNumber, MessageClass, Source, MessageNumber} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MessageSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const msgid = seq(tok(ParenLeft), MessageClass, tok(ParenRightW));
    const simple = seq(MessageTypeAndNumber, opt(msgid));

    const mess1 = seq("ID", Source, "TYPE", Source, "NUMBER", altPrio(MessageNumber, Source));

    return altPrio(simple, mess1);
  }
}