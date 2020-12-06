import {seq, tok, vers, Expression} from "../combi";
import {ParenRightW, ParenLeft} from "../../1_lexer/tokens";
import {TargetField} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InlineData extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = tok(ParenRightW);
    const left = tok(ParenLeft);
    const data = seq("DATA", left, TargetField, right);

    return vers(Version.v740sp02, data);
  }
}