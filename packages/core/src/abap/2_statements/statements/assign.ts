import {IStatement} from "./_statement";
import {str, seqs, alt, opt, tok, per} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {FSTarget, Target, Source, Dynamic, Field} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Assign implements IStatement {

  public getMatcher(): IStatementRunnable {
    const component = seqs("COMPONENT",
                           Source,
                           "OF STRUCTURE",
                           Source);

    const tableField = seqs("TABLE FIELD", alt(new Source(), new Dynamic()));

    const arrow = alt(tok(InstanceArrow), tok(StaticArrow));

    const source = alt(seqs(Source, opt(seqs(arrow, Dynamic))),
                       component,
                       tableField,
                       seqs(Dynamic, opt(seqs(arrow, alt(new Field(), new Dynamic())))));

    const type = seqs("TYPE", alt(new Dynamic(), new Source()));
    const like = seqs("LIKE", alt(new Dynamic(), new Source()));
    const handle = seqs("TYPE HANDLE", Source);
    const range = seqs("RANGE", Source);
    const decimals = seqs("DECIMALS", Source);

    const casting = seqs(opt(str("CASTING")), opt(alt(like, handle, per(type, decimals))));

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