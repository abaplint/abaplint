import {seq, tok, ver, altPrio, Expression} from "../combi";
import {ParenRightW, ParenRight, ParenLeft} from "../../1_lexer/tokens";
import {TargetField} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InlineData extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = altPrio(tok(ParenRightW), tok(ParenRight));
    const left = tok(ParenLeft);
    const data = seq("DATA", left, TargetField, right);

    return ver(Version.v740sp02, data);
  }
}