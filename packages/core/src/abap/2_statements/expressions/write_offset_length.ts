import {regex as reg, Expression, opt, tok, alt, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeft, ParenRightW, WParenLeft, ParenRight} from "../../1_lexer/tokens";
import {FieldChain} from "./field_chain";

export class WriteOffsetLength extends Expression {
  public getRunnable(): IStatementRunnable {

    const post = seq(alt(FieldChain, reg(/^[\d]+$/), reg(/^\*$/)), alt(tok(ParenRightW), tok(ParenRight)));
    const wlength = seq(tok(WParenLeft), post);
    const length = seq(tok(ParenLeft), post);

    const complex = alt(wlength,
                        seq(alt(FieldChain, reg(/^\/?[\w\d]+$/), "/"), opt(length)));

    const at = seq(opt("AT"), complex);

    return at;
  }
}