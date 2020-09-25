import {IStatement} from "./_statement";
import {verNot, str, tok, ver, seq, alt, altPrio, plus, optPrio} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {WPlus, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Move implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mov = verNot(Version.Cloud, str("MOVE"));

    const move = seq(mov,
                     optPrio(str("EXACT")),
                     new Source(),
                     alt(str("TO"), str("?TO")),
                     new Target());

    const calcAssign = ver(Version.v754,
                           alt(seq(tok(WPlus), str("=")),
                               seq(tok(WDash), str("=")),
                               str("/="),
                               str("*="),
                               str("&&=")));

    const assignment = str("=");
    const cast = str("?=");

    const equals = altPrio(altPrio(assignment, cast), calcAssign);

// todo, move "?=" to CAST?
    const eq = seq(plus(seq(new Target(), equals)), new Source());

    return altPrio(move, eq);
  }

}