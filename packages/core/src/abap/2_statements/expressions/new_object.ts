import {alt, tok, seq, Expression, vers, opts, pluss} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source, ParameterListS} from ".";
import {ParenLeftW, WParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class NewObject extends Expression {
  public getRunnable(): IStatementRunnable {
    const lines = pluss(seq(tok(WParenLeftW), Source, tok(WParenRightW)));

    const rparen = alt(tok(WParenRightW), tok(WParenRight));

    const neww = seq("NEW",
                     TypeNameOrInfer,
                     tok(ParenLeftW),
                     opts(alt(Source, ParameterListS, lines)),
                     rparen);

    return vers(Version.v740sp02, neww);
  }
}