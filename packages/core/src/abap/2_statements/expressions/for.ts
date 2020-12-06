import {seq, opts, alts, vers, pluss, Expression} from "../combi";
import {Let, Source, InlineFieldDefinition, Cond, ComponentCond, InlineLoopDefinition, Target} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class For extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq("WHERE", ComponentCond);
    const from = seq("FROM", Source);
    const to = seq("TO", Source);
    const inn = seq(InlineLoopDefinition, opts(from), opts(to), opts(where));
    const then = seq("THEN", Source);
    const whil = seq(alts("UNTIL", "WHILE"), Cond);
    const itera = seq(InlineFieldDefinition, opts(then), whil);

    const groupBy = seq("GROUP BY", FieldChain);

    const groups = vers(Version.v740sp08, seq("GROUPS", FieldChain, "OF", Target, "IN", Source, opts(groupBy)));

    const f = seq("FOR", alts(itera, inn, groups));

    return vers(Version.v740sp05, pluss(seq(f, opts(Let))));
  }
}