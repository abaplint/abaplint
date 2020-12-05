import {seqs, opt, str, alt, ver, plus, Expression} from "../combi";
import {Let, Source, InlineFieldDefinition, Cond, ComponentCond, InlineLoopDefinition, Target} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class For extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seqs("WHERE", ComponentCond);
    const from = seqs("FROM", Source);
    const to = seqs("TO", Source);
    const inn = seqs(InlineLoopDefinition, opt(from), opt(to), opt(where));
    const then = seqs("THEN", Source);
    const whil = seqs(alt(str("UNTIL"), str("WHILE")), Cond);
    const itera = seqs(InlineFieldDefinition, opt(then), whil);

    const groupBy = seqs("GROUP BY", FieldChain);

    const groups = ver(Version.v740sp08, seqs("GROUPS", FieldChain, "OF", Target, "IN", Source, opt(groupBy)));

    const f = seqs("FOR", alt(itera, inn, groups));

    return ver(Version.v740sp05, plus(seqs(f, opt(new Let()))));
  }
}