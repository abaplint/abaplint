import {IStatement} from "./_statement";
import {verNot, str, seq, opt, tok, alt, regex as reg, optPrio, altPrio} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Dynamic, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const right = tok(ParenRightW);

    const contents = altPrio(new Field(), reg(/^\d+$/));

    // todo, reuse the "AT" thing in ULINE and WRITE?
    const pos = seq(reg(/^(\/\d*|\d+)$/), opt(seq(tok(ParenLeft), contents, right)));

    const pos1 = seq(tok(WParenLeft), contents, right);

    const dyn = seq(opt(str("/")), new Dynamic());

    const field = seq(new Field(), tok(ParenLeft), contents, right);

    const ret = seq(str("ULINE"), optPrio(str("AT")), opt(alt(pos, pos1, dyn, field)), optPrio(str("NO-GAP")));

    return verNot(Version.Cloud, ret);
  }

}