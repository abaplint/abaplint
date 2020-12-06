import {seq, tok, Expression, opts, alt} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {MessageTypeAndNumber, MessageClass, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MessageSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const msgid = seq(tok(ParenLeft), MessageClass, tok(ParenRightW));
    const simple = seq(MessageTypeAndNumber, opts(msgid));

    const mess1 = seq("ID", Source, "TYPE", Source, "NUMBER", Source);

    return alt(simple, mess1);
  }
}