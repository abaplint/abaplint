import {IStatement} from "./_statement";
import {verNotLang, tok, ver, seq, alt, altPrio, star, opt, AlsoIn} from "../combi";
import {Target, Source} from "../expressions";
import {LanguageVersion, Release} from "../../../version";
import {WPlus, WDash} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class Move implements IStatement {

  public getMatcher(): IStatementRunnable {

    const mov = verNotLang(LanguageVersion.Cloud, "MOVE");

    const move = seq(mov,
                     altPrio(
                       seq("EXACT", Source, "TO", Target),
                       seq(Source, altPrio("?TO", "TO"), Target)),
                     opt(seq("PERCENTAGE", Source, opt(alt("LEFT", "RIGHT")))));

    const calcAssign = ver(Release.v754,
                           alt(seq(tok(WPlus), "="),
                               seq(tok(WDash), "="),
                               "/=",
                               "*=",
                               "&&="), {also: AlsoIn.OpenABAP});

    const chained = seq("=", star(seq(Target, "=")));

    const equals = altPrio(altPrio(chained, "?="), calcAssign);

// todo, move "?=" to CAST?
    const eq = seq(Target, equals, Source);

    return alt(move, eq);
  }

}