import {IStatement} from "./_statement";
import {verNot, str, seqs, opts, tok, alts, regex as reg, optPrio, altPrios} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Dynamic, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const right = tok(ParenRightW);

    const contents = altPrios(Field, reg(/^\d+$/));

    // todo, reuse the "AT" thing in ULINE and WRITE?
    const pos = seqs(reg(/^(\/\d*|\d+)$/), opts(seqs(tok(ParenLeft), contents, right)));

    const pos1 = seqs(tok(WParenLeft), contents, right);

    const dyn = seqs(opts("/"), Dynamic);

    const field = seqs(Field, tok(ParenLeft), contents, right);

    const ret = seqs("ULINE", optPrio(str("AT")), opts(alts(pos, pos1, dyn, field)), optPrio(str("NO-GAP")));

    return verNot(Version.Cloud, ret);
  }

}