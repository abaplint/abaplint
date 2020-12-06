import {alts, seqs, ver, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ConstantString} from "./constant_string";

export class SQLSourceSimple extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seqs(tok(ParenLeftW), Source, tok(WParenRightW));

    const at = ver(Version.v740sp05, seqs(tok(WAt), alts(FieldChain, paren)));

    return alts(FieldChain, at, new ConstantString());
  }
}