import {seq, opt, str, alt, ver, plus, Expression, IRunnable} from "../combi";
import {Source, Field, FieldSymbol, Cond} from "./";
import {Version} from "../../version";

export class For extends Expression {
  public getRunnable(): IRunnable {
    let where = seq(str("WHERE"), new Cond());
    let inn = seq(str("IN"), new Source(), opt(where));
    let then = seq(str("THEN"), new Source());
    let whil = seq(alt(str("UNTIL"), str("WHILE")), new Cond());
    let itera = seq(str("="), new Source(), opt(then), whil);
    let f = seq(str("FOR"), alt(new Field(), new FieldSymbol()), alt(itera, inn));
    return ver(Version.v740sp05, plus(f));
  }
}