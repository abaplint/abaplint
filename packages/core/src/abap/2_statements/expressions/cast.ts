import {altPrio, tok, seq, Expression, ver, optPrio, opt} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source, Dereference} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Let} from "./let";

export class Cast extends Expression {
  public getRunnable(): IStatementRunnable {
    const rparen = altPrio(tok(WParenRightW), tok(WParenRight));

    const cast = seq("CAST", TypeNameOrInfer, tok(ParenLeftW), optPrio(Let), Source, rparen, opt(Dereference));

    return ver(Version.v740sp02, cast, Version.OpenABAP);
  }
}