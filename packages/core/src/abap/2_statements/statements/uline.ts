import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, tok, alts, regex as reg, optPrio, altPrio} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Dynamic, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const right = tok(ParenRightW);

    const contents = altPrio(new Field(), reg(/^\d+$/));

    // todo, reuse the "AT" thing in ULINE and WRITE?
    const pos = seqs(reg(/^(\/\d*|\d+)$/), opt(seqs(tok(ParenLeft), contents, right)));

    const pos1 = seqs(tok(WParenLeft), contents, right);

    const dyn = seqs(opt(str("/")), new Dynamic());

    const field = seqs(Field, tok(ParenLeft), contents, right);

    const ret = seqs("ULINE", optPrio(str("AT")), opt(alts(pos, pos1, dyn, field)), optPrio(str("NO-GAP")));

    return verNot(Version.Cloud, ret);
  }

}