import {seqs, tok, Expression, opt, alt} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {MessageTypeAndNumber, MessageClass, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MessageSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const msgid = seqs(tok(ParenLeft), MessageClass, tok(ParenRightW));
    const simple = seqs(MessageTypeAndNumber, opt(msgid));

    const mess1 = seqs("ID", Source, "TYPE", Source, "NUMBER", Source);

    return alt(simple, mess1);
  }
}