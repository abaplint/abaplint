import {IStatement} from "./_statement";
import {str, seq, alt, opt, tok, per} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {FSTarget, Target, Source, Dynamic, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assign implements IStatement {

  public getMatcher(): IStatementRunnable {
    const component = seq(str("COMPONENT"),
                          new Source(),
                          str("OF STRUCTURE"),
                          new Source());

    const tableField = seq(str("TABLE FIELD"), alt(new Source(), new Dynamic()));

    const arrow = alt(tok(InstanceArrow), tok(StaticArrow));

    const source = alt(seq(new Source(), opt(seq(arrow, new Dynamic()))),
                       component,
                       tableField,
                       seq(new Dynamic(), opt(seq(arrow, alt(new Field(), new Dynamic())))));

    const type = seq(str("TYPE"), alt(new Dynamic(), new Source()));
    const like = seq(str("LIKE"), alt(new Dynamic(), new Source()));
    const handle = seq(str("TYPE HANDLE"), new Source());
    const range = seq(str("RANGE"), new Source());
    const decimals = seq(str("DECIMALS"), new Source());

    const casting = seq(opt(str("CASTING")), opt(alt(like, handle, per(type, decimals))));

    const ret = seq(str("ASSIGN"),
                    opt(seq(new Target(), str("INCREMENT"))),
                    source,
                    str("TO"),
                    new FSTarget(),
                    casting,
                    opt(range));

    return ret;
  }

}