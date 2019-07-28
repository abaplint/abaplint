import {Statement} from "./_statement";
import {verNot, str, tok, ver, seq, alt, opt, plus, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";
import {WPlus, WDash} from "../tokens";

export class Move extends Statement {

  public getMatcher(): IStatementRunnable {
    const keeping = ver(Version.v740sp05, str("KEEPING TARGET LINES"));
    const expanding = ver(Version.v740sp05, str("EXPANDING NESTED TABLES"));

    const mov = verNot(Version.Cloud, str("MOVE"));

    const move = seq(alt(mov, str("MOVE-CORRESPONDING")),
                     opt(str("EXACT")),
                     new Source(),
                     alt(str("TO"), str("?TO")),
                     new Target(),
                     opt(expanding),
                     opt(keeping));

    const calcAssign = ver(Version.v755,
                           alt(seq(tok(WPlus), str("=")),
                               seq(tok(WDash), str("=")),
                               str("/="),
                               str("*=")));

    const equals = alt(alt(str("="), str("?=")), calcAssign);

// todo, move "?=" to CAST?
    const eq = seq(plus(seq(new Target(), equals)), new Source());

    return alt(move, eq);
  }

}