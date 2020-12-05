import {alt, seqs, ver, tok, Expression} from "../combi";
import {Version} from "../../../version";
import {WAt, At} from "../../1_lexer/tokens";
import {Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    const at = ver(Version.v740sp05, seqs(alt(tok(WAt), tok(At)), Target));

    return alt(new Target(), at);
  }
}