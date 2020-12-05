import {seqs, tok, ver, Expression} from "../combi";
import {ParenRightW, ParenLeft} from "../../1_lexer/tokens";
import {TargetField} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InlineData extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const data = seqs("DATA", left, TargetField, right);

    return ver(Version.v740sp02, data);
  }
}