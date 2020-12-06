import {alts, seq, vers, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ConstantString} from "./constant_string";

export class SQLSourceSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));

    const at = vers(Version.v740sp05, seq(tok(WAt), alts(FieldChain, paren)));

    return alts(FieldChain, at, ConstantString);
  }
}