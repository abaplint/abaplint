import {altPrio, tok, seq, Expression, ver, optPrio, opt, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {TypeNameOrInfer, Source, Dereference} from ".";
import {ParenLeftW, WParenRightW, WParenRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Let} from "./let";

export class Cast extends Expression {
  public getRunnable(): IStatementRunnable {
    const rparen = altPrio(tok(WParenRightW), tok(WParenRight));

    const cast = seq("CAST", TypeNameOrInfer, tok(ParenLeftW), optPrio(Let), Source, rparen, opt(Dereference));

    return ver(Release.v740sp02, cast, {also: AlsoIn.OpenABAP});
  }
}