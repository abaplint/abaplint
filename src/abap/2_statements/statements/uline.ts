import {IStatement} from "./_statement";
import {verNot, str, seq, opt, tok, alt, regex as reg, optPrio, IStatementRunnable} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Dynamic} from "../expressions";
import {Version} from "../../../version";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const right = tok(ParenRightW);

    // todo, reuse the "AT" thing in ULINE and WRITE?
    const pos = alt(seq(reg(/^(\/\d*|\d+)$/),
                        opt(seq(tok(ParenLeft), reg(/^\d+$/), right))),
                    seq(tok(WParenLeft), reg(/^\d+$/), right));

    const dyn = seq(opt(str("/")), new Dynamic());

    const ret = seq(str("ULINE"), optPrio(str("AT")), opt(alt(pos, dyn)), optPrio(str("NO-GAP")));

    return verNot(Version.Cloud, ret);
  }

}