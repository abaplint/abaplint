import {seq, opt, alt, ver, Expression, optPrio, altPrio, plus} from "../combi";
import {Let, Source, InlineFieldDefinition, Cond, ComponentCond, LoopGroupByComponent, InlineLoopDefinition, TargetField, TargetFieldSymbol} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class For extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq("WHERE (", ComponentCond, ")");
    const from = seq("FROM", Source);
    const to = seq("TO", Source);
    const inn = seq(InlineLoopDefinition, optPrio(from), optPrio(to), optPrio(where));
    const then = seq("THEN", Source);
    const whil = seq(altPrio("UNTIL", "WHILE"), Cond);
    const itera = seq(InlineFieldDefinition, opt(then), whil);

    const groupBy = seq("GROUP BY",
                        alt(FieldChain, seq("(", plus(LoopGroupByComponent), ")")),
                        opt(seq(alt("ASCENDING", "DESCENDING"), opt("AS TEXT"))),
                        opt("WITHOUT MEMBERS"));

    const t = alt(TargetField, TargetFieldSymbol);
    const groups = ver(Version.v740sp08, seq("GROUPS", t, "OF", t, "IN", Source, optPrio(groupBy)));

    const f = seq("FOR", alt(itera, inn, groups), optPrio(Let));

    return ver(Version.v740sp05, f);
  }
}