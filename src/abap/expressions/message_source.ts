import {seq, tok, regex as reg, Expression, IStatementRunnable, opt, str, alt} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens";
import {MessageClass, Source} from ".";

export class MessageSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const msgid = seq(tok(ParenLeft), new MessageClass(), tok(ParenRightW));
    const simple = seq(reg(/^\w\d\d\d$/), opt(msgid));

    const mess1 = seq(str("ID"), new Source(), str("TYPE"), new Source(), str("NUMBER"), new Source());

    return alt(simple, mess1);
  }
}