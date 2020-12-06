import {IStatement} from "./_statement";
import {seq, alt, altPrio, opt, regex, per, pluss, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ParameterS, FieldSub, NamespaceSimpleName, FieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

// todo, cloud, split?
export class Export implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq("FROM", Source);
    const client = seq("CLIENT", Source);
    const id = seq("ID", Source);
    const using = seq("USING", Source);

    const cluster = seq(NamespaceSimpleName,
                        tok(ParenLeft),
                        regex(/^[\w$%\^]{2}$/),
                        tok(ParenRightW));

    const buffer = seq("DATA BUFFER", Target);
    const memory = seq("MEMORY ID", Source);
    const table = seq("INTERNAL TABLE", Target);
    const shared = seq(alt("SHARED MEMORY", "SHARED BUFFER"), cluster, per(from, client, id));
    const database = seq("DATABASE", cluster, per(from, client, id, using));

    const target = alt(buffer, memory, database, table, shared);

    const left = alt(FieldSub, FieldSymbol);

    const source = alt(pluss(altPrio(ParameterS, seq(left, from), left)),
                       Dynamic);

    const compression = seq("COMPRESSION", alt("ON", "OFF"));
    const hint = seq("CODE PAGE HINT", Source);

    return seq("EXPORT", source, "TO", target, opt(compression), opt(hint));
  }

}
