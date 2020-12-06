import {IStatement} from "./_statement";
import {str, seqs, alts, opt, tok, per} from "../combi";
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

    const source = alts(seqs(Source, opt(seqs(arrow, Dynamic))),
                        component,
                        tableField,
                        seqs(Dynamic, opt(seqs(arrow, alts(Field, Dynamic)))));

    const type = seqs("TYPE", alts(Dynamic, Source));
    const like = seqs("LIKE", alts(Dynamic, Source));
    const handle = seqs("TYPE HANDLE", Source);
    const range = seqs("RANGE", Source);
    const decimals = seqs("DECIMALS", Source);

    const casting = seqs(opt(str("CASTING")), opt(alts(like, handle, per(type, decimals))));

    const ret = seqs("ASSIGN",
                     opt(seqs(Target, "INCREMENT")),
                     source,
                     "TO",
                     FSTarget,
                     casting,
                     opt(range));

    return ret;
  }

}