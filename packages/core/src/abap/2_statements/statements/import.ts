import {IStatement} from "./_statement";
import {verNot, seq, opts, alt, regex, pers, pluss, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ComponentChainSimple, NamespaceSimpleName, FieldSymbol} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Import implements IStatement {

  public getMatcher(): IStatementRunnable {
    const dto = seq("TO", Target);
    const client = seq("CLIENT", Source);
    const id = seq("ID", Source);
    const using = seq("USING", Source);

    const cluster = seq(NamespaceSimpleName,
                        tok(ParenLeft),
                        regex(/^[\w$%\^]{2}$/),
                        tok(ParenRightW));

    const buffer = seq("DATA BUFFER", Source);
    const memory = seq("MEMORY ID", Source);
    const table = seq("INTERNAL TABLE", Source);
    const shared = seq(alt("SHARED MEMORY", "SHARED BUFFER"), cluster, pers(dto, client, id));
    const database = seq("DATABASE", cluster, pers(dto, client, id, using));

    const source = alt(buffer, memory, database, table, shared);

    const to = pluss(seq(ComponentChainSimple, alt("TO", "INTO"), Target));

    const toeq = pluss(seq(alt(ComponentChainSimple, FieldSymbol), "=", Target));

    const target = alt(toeq,
                       to,
                       Dynamic,
                       pluss(Target));

    const options = pers("ACCEPTING PADDING",
                         "IGNORING CONVERSION ERRORS",
                         "IN CHAR-TO-HEX MODE",
                         "IGNORING STRUCTURE BOUNDARIES",
                         "ACCEPTING TRUNCATION",
                         seq("REPLACEMENT CHARACTER", Source),
                         seq("CODE PAGE INTO", Source),
                         seq("ENDIAN INTO", Source));

    const ret = seq("IMPORT", target, "FROM", source, opts(options));

    return verNot(Version.Cloud, ret);
  }

}
