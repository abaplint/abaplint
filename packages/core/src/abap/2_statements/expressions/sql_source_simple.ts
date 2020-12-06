import {alt, seq, vers, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ConstantString} from "./constant_string";

export class SQLSourceSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));

    const at = vers(Version.v740sp05, seq(tok(WAt), alt(FieldChain, paren)));

    return alt(FieldChain, at, ConstantString);
  }
}