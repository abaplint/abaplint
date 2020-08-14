import {seq, alt, tok, Expression, altPrio} from "../combi";
import {ParenLeftW, WParenRight, WParenRightW, ParenLeft, ParenRight, ParenRightW} from "../../1_lexer/tokens";
import {Source, ParameterListS, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = alt(new Source(), new ParameterListS(), new MethodParameters());

    // rule ParserMissingSpace makes sure the whitespace is correct
    const right1 = altPrio(tok(WParenRight), tok(WParenRightW), tok(ParenRight), tok(ParenRightW));
    const right2 = altPrio(tok(WParenRight), tok(WParenRightW));

    const ret = altPrio(
      seq(tok(ParenLeftW), param, right1),
      seq(tok(ParenLeft), param, right2));
    return ret;
  }
}