import {IStatement} from "./_statement";
import {verNot, tok, ver, seq, alt, altPrio, star} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {WPlus, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Move implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mov = verNot(Version.Cloud, "MOVE");

    const move = seq(mov,
                     altPrio(
                       seq("EXACT", Source, "TO", Target),
                       seq(Source, altPrio("?TO", "TO"), Target)));


    const calcAssign = ver(Version.v754,
                           alt(seq(tok(WPlus), "="),
                               seq(tok(WDash), "="),
                               "/=",
                               "*=",
                               "&&="));

    const chained = seq("=", star(seq(Target, "=")));

    const equals = altPrio(altPrio(chained, "?="), calcAssign);

// todo, move "?=" to CAST?
    const eq = seq(Target, equals, Source);

    return altPrio(move, eq);
  }

}