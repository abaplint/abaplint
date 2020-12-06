import {alts, seqs, ver, tok, Expression, altPrio} from "../combi";
import {Version} from "../../../version";
import {WAt, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SQLAliasField, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class SQLSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seqs(tok(ParenLeftW), Source, tok(WParenRightW));

// todo, this Source must be a simple field?
    const at = ver(Version.v740sp05, seqs(tok(WAt), alts(Source, paren)));

    return altPrio(new SQLAliasField(), new Source(), at);
  }
}