import {regex as reg, Expression, opt, tok, alt, seq} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeft, ParenRightW, WParenLeft, ParenRight} from "../../1_lexer/tokens";
import {SimpleFieldChain2} from "./simple_field_chain2";

export class WriteOffsetLength extends Expression {
  public getRunnable(): IStatementRunnable {

    const post = seq(alt(SimpleFieldChain2, reg(/^[\d]+$/), reg(/^\*$/)), alt(tok(ParenRightW), tok(ParenRight)));
    const wlength = seq(tok(WParenLeft), post);
    const length = seq(tok(ParenLeft), post);

    const complex = alt(wlength,
                        seq(alt(SimpleFieldChain2, reg(/^\/?[\w\d]+$/), "/"), opt(length)));

    const at = seq(opt("AT"), complex);

    return at;
  }
}