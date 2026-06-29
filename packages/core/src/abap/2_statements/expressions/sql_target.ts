import {altPrio, seq, ver, tok, opt, Expression, AlsoIn} from "../combi";
import {Release} from "../../../version";
import {WAt, At} from "../../1_lexer/tokens";
import {Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    const n = ver(Release.v754, "NEW");
    const at = ver(Release.v740sp05, seq(opt(n), altPrio(tok(WAt), tok(At)), Target), {also: AlsoIn.OpenABAP});

    return altPrio(at, Target);
  }
}