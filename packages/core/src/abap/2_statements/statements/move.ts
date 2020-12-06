import {IStatement} from "./_statement";
import {verNot, str, tok, ver, seqs, alts, altPrios, pluss} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {WPlus, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Move implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mov = verNot(Version.Cloud, str("MOVE"));

    const move = seqs(mov,
                      altPrios(
                        seqs("EXACT", Source, "TO", Target),
                        seqs(Source, altPrios("?TO", "TO"), Target)));


    const calcAssign = ver(Version.v754,
                           alts(seqs(tok(WPlus), "="),
                                seqs(tok(WDash), "="),
                                "/=",
                                "*=",
                                "&&="));

    const equals = altPrios(altPrios("=", "?="), calcAssign);

// todo, move "?=" to CAST?
    const eq = seqs(pluss(seqs(Target, equals)), Source);

    return altPrios(move, eq);
  }

}