import {seqs, str, opt, Expression, tok, alts} from "../combi";
import {ClassName, ParameterListS, Source} from ".";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Throw extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, MESSAGE
    return seqs("THROW",
                opt(str("RESUMABLE")),
                ClassName,
                tok(ParenLeftW),
                opt(alts(Source, ParameterListS)),
                tok(WParenRightW));
  }
}