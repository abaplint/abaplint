import {IStatement} from "./_statement";
import {seq, alt, opts, tok, pers} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {FSTarget, Target, Source, Dynamic, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assign implements IStatement {

  public getMatcher(): IStatementRunnable {
    const component = seq("COMPONENT",
                          Source,
                          "OF STRUCTURE",
                          Source);

    const tableField = seq("TABLE FIELD", alt(Source, Dynamic));

    const arrow = alt(tok(InstanceArrow), tok(StaticArrow));

    const source = alt(seq(Source, opts(seq(arrow, Dynamic))),
                       component,
                       tableField,
                       seq(Dynamic, opts(seq(arrow, alt(Field, Dynamic)))));

    const type = seq("TYPE", alt(Dynamic, Source));
    const like = seq("LIKE", alt(Dynamic, Source));
    const handle = seq("TYPE HANDLE", Source);
    const range = seq("RANGE", Source);
    const decimals = seq("DECIMALS", Source);

    const casting = seq(opts("CASTING"), opts(alt(like, handle, pers(type, decimals))));

    const ret = seq("ASSIGN",
                    opts(seq(Target, "INCREMENT")),
                    source,
                    "TO",
                    FSTarget,
                    casting,
                    opts(range));

    return ret;
  }

}