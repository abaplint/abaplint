import {str, seq, tok, ver, Expression, IStatementRunnable} from "../combi";
import {ParenRightW, ParenLeft} from "../../1_lexer/tokens";
import {TargetField} from ".";
import {Version} from "../../../version";

export class InlineData extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const data = seq(str("DATA"), left, new TargetField(), right);

    return ver(Version.v740sp02, data);
  }
}