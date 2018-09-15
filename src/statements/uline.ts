import {Statement} from "./statement";
import {verNot, str, seq, opt, tok, alt, regex as reg, optPrio, IRunnable} from "../combi";
import {ParenLeft, ParenRight, WParenLeft, ParenRightW} from "../tokens/";
import {Dynamic} from "../expressions";
import {Version} from "../version";

export class Uline extends Statement {

  public static get_matcher(): IRunnable {
    let right = alt(tok(ParenRight), tok(ParenRightW));

    let pos = alt(seq(reg(/^(\/\d*|\d+)$/),
                      opt(seq(tok(ParenLeft), reg(/^\d+$/), right))),
                  seq(tok(WParenLeft), reg(/^\d+$/), right));

    let ret = seq(str("ULINE"), optPrio(str("AT")), opt(alt(pos, new Dynamic())));

    return verNot(Version.Cloud, ret);
  }

}