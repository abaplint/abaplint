import {altPrios, tok, seqs, Expression, vers, optPrios} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Let} from "./let";

export class Cast extends Expression {
  public getRunnable(): IStatementRunnable {
    const rparen = altPrios(tok(WParenRightW), tok(WParenRight));

    const cast = seqs("CAST", TypeNameOrInfer, tok(ParenLeftW), optPrios(Let), Source, rparen);

    return vers(Version.v740sp02, cast);
  }
}