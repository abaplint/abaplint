import {seq, tok, ver, altPrio, Expression, AlsoIn} from "../combi";
import {ParenRightW, ParenRight, ParenLeft} from "../../1_lexer/tokens";
import {TargetField} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InlineData extends Expression {
  public getRunnable(): IStatementRunnable {
    const right = altPrio(tok(ParenRightW), tok(ParenRight));
    const left = tok(ParenLeft);
    const data = seq("DATA", left, TargetField, right);
    const final = seq("FINAL", left, TargetField, right);

    return altPrio(ver(Release.v740sp02, data, {also: AlsoIn.OpenABAP}), ver(Release.v757, final, {also: AlsoIn.OpenABAP})) ;
  }
}