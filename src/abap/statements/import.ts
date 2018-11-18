import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, plus, IRunnable} from "../combi";
import {Target, Source, ParameterListT, Dynamic, Field} from "../expressions";
import {Version} from "../../version";

export class Import extends Statement {

  public getMatcher(): IRunnable {
    const id = seq(str("ID"), new Source());
    const dto = seq(str("TO"), new Target());
    const client = seq(str("CLIENT"), new Source());

    const options = per(str("ACCEPTING PADDING"),
                        str("IGNORING CONVERSION ERRORS"),
                        str("IN CHAR-TO-HEX MODE"),
                        str("IGNORING STRUCTURE BOUNDARIES"),
                        str("ACCEPTING TRUNCATION"));

    const shared = seq(str("SHARED"),
                       alt(str("MEMORY"), str("BUFFER")),
                       new Field(),
                       str("("),
                       new Field(),
                       str(")"),
                       str("ID"),
                       new Source());

    const buffer = seq(str("DATA BUFFER"), new Source());
    const memory = seq(str("MEMORY ID"), new Source());
    const table = seq(str("INTERNAL TABLE"), new Source());

    const database = seq(str("DATABASE"),
                         new Source(),
                         per(dto, id, client));

    const source = alt(buffer, memory, database, table, shared);

    const to = plus(seq(new Source(),
                        alt(str("TO"), str("INTO")),
                        new Target()));

    const target = alt(new ParameterListT(),
                       to,
                       new Dynamic(),
                       plus(new Target()));

    const ret = seq(str("IMPORT"), target, str("FROM"), source, opt(options));

    return verNot(Version.Cloud, ret);
  }

}