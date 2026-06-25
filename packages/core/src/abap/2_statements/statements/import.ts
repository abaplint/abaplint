import {IStatement} from "./_statement";
import {seq, opt, alt, regex, per, plus, tok, verNotLang} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ComponentChainSimple, NamespaceSimpleName, FieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

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
    const memory = verNotLang(LanguageVersion.KeyUser, seq("MEMORY", opt(seq("ID", Source))));
    const table = seq("INTERNAL TABLE", Source);
    const shared = verNotLang(LanguageVersion.KeyUser, seq(alt("SHARED MEMORY", "SHARED BUFFER"), cluster, per(dto, client, id)));
    const database = verNotLang(LanguageVersion.KeyUser, seq("DATABASE", cluster, per(dto, client, id, using)));
    const logfile = verNotLang(LanguageVersion.KeyUser, seq("LOGFILE ID", Source));

    const source = alt(buffer, memory, database, table, shared, logfile);

    const to = plus(seq(ComponentChainSimple, alt("TO", "INTO"), Target));

    const toeq = plus(seq(alt(ComponentChainSimple, FieldSymbol), "=", Target));

    const target = alt(toeq,
                       to,
                       Dynamic,
                       plus(Target));

    const options = per("ACCEPTING PADDING",
                        "IGNORING CONVERSION ERRORS",
                        "IN CHAR-TO-HEX MODE",
                        "IGNORING STRUCTURE BOUNDARIES",
                        "ACCEPTING TRUNCATION",
                        seq("REPLACEMENT CHARACTER", Source),
                        seq("CODE PAGE INTO", Source),
                        seq("ENDIAN INTO", Source));

    const ret = seq("IMPORT", target, "FROM", source, opt(options));

    return ret;
  }

}
