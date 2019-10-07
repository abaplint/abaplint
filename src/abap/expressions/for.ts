import {seq, opt, str, alt, ver, plus, Expression, IStatementRunnable} from "../combi";
import {Source, InlineFieldDefinition, Cond, FieldSymbol, Field} from "./";
import {Version} from "../../version";
import {Let} from "./let";

export class For extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq(str("WHERE"), new Cond());
    const from = seq(str("FROM"), new Source());
    const to = seq(str("TO"), new Source());
    const inn = seq(alt(new FieldSymbol(), new Field()), str("IN"), new Source(), opt(from), opt(to), opt(where));
    const then = seq(str("THEN"), new Source());
    const whil = seq(alt(str("UNTIL"), str("WHILE")), new Cond());
    const itera = seq(new InlineFieldDefinition(), opt(then), whil);
    const f = seq(str("FOR"), alt(itera, inn));
    return ver(Version.v740sp05, plus(seq(f, opt(new Let()))));
  }
}