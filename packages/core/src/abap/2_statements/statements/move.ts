import {IStatement} from "./_statement";
import {verNot, str, tok, ver, seqs, alt, altPrio, plus} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {WPlus, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Move implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mov = verNot(Version.Cloud, str("MOVE"));

    const move = seqs(mov,
                      altPrio(
                        seqs("EXACT", Source, "TO", Target),
                        seqs(Source, altPrio(str("?TO"), str("TO")), Target)));


    const calcAssign = ver(Version.v754,
                           alt(seqs(tok(WPlus), "="),
                               seqs(tok(WDash), "="),
                               str("/="),
                               str("*="),
                               str("&&=")));

    const assignment = str("=");
    const cast = str("?=");

    const equals = altPrio(altPrio(assignment, cast), calcAssign);

// todo, move "?=" to CAST?
    const eq = seqs(plus(seqs(Target, equals)), Source);

    return altPrio(move, eq);
  }

}