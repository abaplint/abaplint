import {seq, opt, str, alt, ver, plus, Expression} from "../combi";
import {Let, Source, InlineFieldDefinition, Cond, ComponentCond, InlineLoopDefinition, Target} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {FieldChain} from "./field_chain";

export class For extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq(str("WHERE"), new ComponentCond());
    const from = seq(str("FROM"), new Source());
    const to = seq(str("TO"), new Source());
    const inn = seq(new InlineLoopDefinition(), opt(from), opt(to), opt(where));
    const then = seq(str("THEN"), new Source());
    const whil = seq(alt(str("UNTIL"), str("WHILE")), new Cond());
    const itera = seq(new InlineFieldDefinition(), opt(then), whil);

    const groupBy = seq(str("GROUP BY"), new FieldChain());

    const groups = ver(Version.v740sp08, seq(str("GROUPS"), new FieldChain(), str("OF"), new Target(), str("IN"), new Source(), opt(groupBy)));

    const f = seq(str("FOR"), alt(itera, inn, groups));

    return ver(Version.v740sp05, plus(seq(f, opt(new Let()))));
  }
}