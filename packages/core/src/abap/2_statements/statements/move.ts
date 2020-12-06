import {IStatement} from "./_statement";
import {verNot, tok, vers, seq, alts, altPrios, pluss} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {WPlus, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Move implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mov = verNot(Version.Cloud, "MOVE");

    const move = seq(mov,
                     altPrios(
                       seq("EXACT", Source, "TO", Target),
                       seq(Source, altPrios("?TO", "TO"), Target)));


    const calcAssign = vers(Version.v754,
                            alts(seq(tok(WPlus), "="),
                                 seq(tok(WDash), "="),
                                 "/=",
                                 "*=",
                                 "&&="));

    const equals = altPrios(altPrios("=", "?="), calcAssign);

// todo, move "?=" to CAST?
    const eq = seq(pluss(seq(Target, equals)), Source);

    return altPrios(move, eq);
  }

}