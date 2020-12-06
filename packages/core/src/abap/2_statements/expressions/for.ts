import {seqs, opts, alts, ver, plus, Expression} from "../combi";
import {Let, Source, InlineFieldDefinition, Cond, ComponentCond, InlineLoopDefinition, Target} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class For extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seqs("WHERE", ComponentCond);
    const from = seqs("FROM", Source);
    const to = seqs("TO", Source);
    const inn = seqs(InlineLoopDefinition, opts(from), opts(to), opts(where));
    const then = seqs("THEN", Source);
    const whil = seqs(alts("UNTIL", "WHILE"), Cond);
    const itera = seqs(InlineFieldDefinition, opts(then), whil);

    const groupBy = seqs("GROUP BY", FieldChain);

    const groups = ver(Version.v740sp08, seqs("GROUPS", FieldChain, "OF", Target, "IN", Source, opts(groupBy)));

    const f = seqs("FOR", alts(itera, inn, groups));

    return ver(Version.v740sp05, plus(seqs(f, opts(Let))));
  }
}