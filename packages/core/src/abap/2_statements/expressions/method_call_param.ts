import {seqs, alts, tok, Expression, altPrios} from "../combi";
import {ParenLeftW, WParenRight, WParenRightW, ParenLeft, ParenRight, ParenRightW} from "../../1_lexer/tokens";
import {Source, ParameterListS, MethodParameters} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const param = alts(Source, ParameterListS, MethodParameters);

    // rule ParserMissingSpace makes sure the whitespace is correct
    const right1 = altPrios(tok(WParenRight), tok(WParenRightW), tok(ParenRight), tok(ParenRightW));
    const right2 = altPrios(tok(WParenRight), tok(WParenRightW));

    const ret = altPrios(
      seqs(tok(ParenLeftW), param, right1),
      seqs(tok(ParenLeft), param, right2));
    return ret;
  }
}