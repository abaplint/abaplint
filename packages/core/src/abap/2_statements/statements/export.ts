import {IStatement} from "./_statement";
import {seqs, alts, altPrios, opt, regex, per, plus, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ParameterS, FieldSub, NamespaceSimpleName, FieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

// todo, cloud, split?
export class Export implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seqs("FROM", Source);
    const client = seqs("CLIENT", Source);
    const id = seqs("ID", Source);
    const using = seqs("USING", Source);

    const cluster = seqs(NamespaceSimpleName,
                         tok(ParenLeft),
                         regex(/^[\w$%\^]{2}$/),
                         tok(ParenRightW));

    const buffer = seqs("DATA BUFFER", Target);
    const memory = seqs("MEMORY ID", Source);
    const table = seqs("INTERNAL TABLE", Target);
    const shared = seqs(alts("SHARED MEMORY", "SHARED BUFFER"), cluster, per(from, client, id));
    const database = seqs("DATABASE", cluster, per(from, client, id, using));

    const target = alts(buffer, memory, database, table, shared);

    const left = alts(FieldSub, FieldSymbol);

    const source = alts(plus(altPrios(ParameterS, seqs(left, from), left)),
                        Dynamic);

    const compression = seqs("COMPRESSION", alts("ON", "OFF"));
    const hint = seqs("CODE PAGE HINT", Source);

    return seqs("EXPORT", source, "TO", target, opt(compression), opt(hint));
  }

}
