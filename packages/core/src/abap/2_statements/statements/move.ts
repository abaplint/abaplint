import {IStatement} from "./_statement";
import {verNot, tok, vers, seq, alt, altPrio, plus} from "../combi";
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


    const calcAssign = vers(Version.v754,
                            alt(seq(tok(WPlus), "="),
                                seq(tok(WDash), "="),
                                "/=",
                                "*=",
                                "&&="));

    const equals = altPrio(altPrio("=", "?="), calcAssign);

// todo, move "?=" to CAST?
    const eq = seq(plus(seq(Target, equals)), Source);

    return altPrio(move, eq);
  }

}