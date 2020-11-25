import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, regex, per, plus, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ComponentChainSimple, NamespaceSimpleName, FieldSymbol} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Import implements IStatement {

  public getMatcher(): IStatementRunnable {
    const dto = seq(str("TO"), new Target());
    const client = seq(str("CLIENT"), new Source());
    const id = seq(str("ID"), new Source());
    const using = seq(str("USING"), new Source());

    const cluster = seq(new NamespaceSimpleName(),
                        tok(ParenLeft),
                        regex(/^[\w$%\^]{2}$/),
                        tok(ParenRightW));

    const buffer = seq(str("DATA BUFFER"), new Source());
    const memory = seq(str("MEMORY ID"), new Source());
    const table = seq(str("INTERNAL TABLE"), new Source());
    const shared = seq(alt(str("SHARED MEMORY"), str("SHARED BUFFER")), cluster, per(dto, client, id));
    const database = seq(str("DATABASE"), cluster, per(dto, client, id, using));

    const source = alt(buffer, memory, database, table, shared);

    const to = plus(seq(new ComponentChainSimple(),
                        alt(str("TO"), str("INTO")),
                        new Target()));

    const toeq = plus(seq(alt(new ComponentChainSimple(), new FieldSymbol()),
                          str("="),
                          new Target()));

    const target = alt(toeq,
                       to,
                       new Dynamic(),
                       plus(new Target()));

    const options = per(str("ACCEPTING PADDING"),
                        str("IGNORING CONVERSION ERRORS"),
                        str("IN CHAR-TO-HEX MODE"),
                        str("IGNORING STRUCTURE BOUNDARIES"),
                        str("ACCEPTING TRUNCATION"),
                        seq(str("REPLACEMENT CHARACTER"), new Source()),
                        seq(str("CODE PAGE INTO"), new Source()),
                        seq(str("ENDIAN INTO"), new Source()));

    const ret = seq(str("IMPORT"), target, str("FROM"), source, opt(options));

    return verNot(Version.Cloud, ret);
  }

}
