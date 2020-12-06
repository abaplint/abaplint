import {IStatement} from "./_statement";
import {verNot, seq, opts, tok, alt, regex as reg, optPrios, altPrios} from "../combi";
import {ParenLeft, WParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Dynamic, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Uline implements IStatement {

  public getMatcher(): IStatementRunnable {
    const right = tok(ParenRightW);

    const contents = altPrios(Field, reg(/^\d+$/));

    // todo, reuse the "AT" thing in ULINE and WRITE?
    const pos = seq(reg(/^(\/\d*|\d+)$/), opts(seq(tok(ParenLeft), contents, right)));

    const pos1 = seq(tok(WParenLeft), contents, right);

    const dyn = seq(opts("/"), Dynamic);

    const field = seq(Field, tok(ParenLeft), contents, right);

    const ret = seq("ULINE", optPrios("AT"), opts(alt(pos, pos1, dyn, field)), optPrios("NO-GAP"));

    return verNot(Version.Cloud, ret);
  }

}