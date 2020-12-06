import {altPrio, tok, seq, Expression, vers, optPrios} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Let} from "./let";

export class Cast extends Expression {
  public getRunnable(): IStatementRunnable {
    const rparen = altPrio(tok(WParenRightW), tok(WParenRight));

    const cast = seq("CAST", TypeNameOrInfer, tok(ParenLeftW), optPrios(Let), Source, rparen);

    return vers(Version.v740sp02, cast);
  }
}