import {IStatement} from "./_statement";
import {verNot, seqs, opts, alts, regex, pers, pluss, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ComponentChainSimple, NamespaceSimpleName, FieldSymbol} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Import implements IStatement {

  public getMatcher(): IStatementRunnable {
    const dto = seqs("TO", Target);
    const client = seqs("CLIENT", Source);
    const id = seqs("ID", Source);
    const using = seqs("USING", Source);

    const cluster = seqs(NamespaceSimpleName,
                         tok(ParenLeft),
                         regex(/^[\w$%\^]{2}$/),
                         tok(ParenRightW));

    const buffer = seqs("DATA BUFFER", Source);
    const memory = seqs("MEMORY ID", Source);
    const table = seqs("INTERNAL TABLE", Source);
    const shared = seqs(alts("SHARED MEMORY", "SHARED BUFFER"), cluster, pers(dto, client, id));
    const database = seqs("DATABASE", cluster, pers(dto, client, id, using));

    const source = alts(buffer, memory, database, table, shared);

    const to = pluss(seqs(ComponentChainSimple, alts("TO", "INTO"), Target));

    const toeq = pluss(seqs(alts(ComponentChainSimple, FieldSymbol), "=", Target));

    const target = alts(toeq,
                        to,
                        Dynamic,
                        pluss(Target));

    const options = pers("ACCEPTING PADDING",
                         "IGNORING CONVERSION ERRORS",
                         "IN CHAR-TO-HEX MODE",
                         "IGNORING STRUCTURE BOUNDARIES",
                         "ACCEPTING TRUNCATION",
                         seqs("REPLACEMENT CHARACTER", Source),
                         seqs("CODE PAGE INTO", Source),
                         seqs("ENDIAN INTO", Source));

    const ret = seqs("IMPORT", target, "FROM", source, opts(options));

    return verNot(Version.Cloud, ret);
  }

}
