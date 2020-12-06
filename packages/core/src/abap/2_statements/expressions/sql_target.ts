import {alt, seq, vers, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, At} from "../../1_lexer/tokens";
import {Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    const at = vers(Version.v740sp05, seq(alt(tok(WAt), tok(At)), Target));

    return alt(Target, at);
  }
}