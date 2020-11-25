import {alt, seq, ver, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ConstantString} from "./constant_string";

export class SQLSourceSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), new Source(), tok(WParenRightW));

    const at = ver(Version.v740sp05, seq(tok(WAt), alt(new FieldChain(), paren)));

    return alt(new FieldChain(), at, new ConstantString());
  }
}