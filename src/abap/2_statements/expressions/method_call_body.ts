import {seq, alt, opt, str, tok, Expression, IStatementRunnable} from "../combi";
import {ParenLeftW} from "../../1_lexer/tokens";
import {Source, ParameterListS, MethodParameters} from ".";

export class MethodCallBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW),
                      alt(new Source(), new ParameterListS(), new MethodParameters()),
                      str(")"));

    const dynamicPar = seq(str("PARAMETER-TABLE"), new Source());
    const dynamicExc = seq(str("EXCEPTION-TABLE"), new Source());
    const dynamic = seq(dynamicPar, opt(dynamicExc));

    return alt(paren, new MethodParameters(), dynamic);
  }
}