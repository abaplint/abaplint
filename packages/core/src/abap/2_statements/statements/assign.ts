import {IStatement} from "./_statement";
import {seqs, alts, opts, tok, pers} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {FSTarget, Target, Source, Dynamic, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assign implements IStatement {

  public getMatcher(): IStatementRunnable {
    const component = seqs("COMPONENT",
                           Source,
                           "OF STRUCTURE",
                           Source);

    const tableField = seqs("TABLE FIELD", alts(Source, Dynamic));

    const arrow = alts(tok(InstanceArrow), tok(StaticArrow));

    const source = alts(seqs(Source, opts(seqs(arrow, Dynamic))),
                        component,
                        tableField,
                        seqs(Dynamic, opts(seqs(arrow, alts(Field, Dynamic)))));

    const type = seqs("TYPE", alts(Dynamic, Source));
    const like = seqs("LIKE", alts(Dynamic, Source));
    const handle = seqs("TYPE HANDLE", Source);
    const range = seqs("RANGE", Source);
    const decimals = seqs("DECIMALS", Source);

    const casting = seqs(opts("CASTING"), opts(alts(like, handle, pers(type, decimals))));

    const ret = seqs("ASSIGN",
                     opts(seqs(Target, "INCREMENT")),
                     source,
                     "TO",
                     FSTarget,
                     casting,
                     opts(range));

    return ret;
  }

}