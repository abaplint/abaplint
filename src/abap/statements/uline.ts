import {Statement} from "./_statement";
import {verNot, str, seq, opt, tok, alt, regex as reg, optPrio, IRunnable} from "../combi";
import {ParenLeft, ParenRight, WParenLeft, ParenRightW} from "../tokens/";
import {Dynamic} from "../expressions";
import {Version} from "../../version";

export class Uline extends Statement {

  public getMatcher(): IRunnable {
    let right = alt(tok(ParenRight), tok(ParenRightW));

    // todo, reuse the AT thing in ULINE and WRITE?
    let pos = alt(seq(reg(/^(\/\d*|\d+)$/),
                      opt(seq(tok(ParenLeft), reg(/^\d+$/), right))),
                  seq(tok(WParenLeft), reg(/^\d+$/), right));

    let dyn = seq(opt(str("/")), new Dynamic());

    let ret = seq(str("ULINE"), optPrio(str("AT")), opt(alt(pos, dyn)));

    return verNot(Version.Cloud, ret);
  }

}