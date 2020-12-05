import {IStatement} from "./_statement";
import {str, seqs, alt, altPrio, opt, regex, per, plus, tok} from "../combi";
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
    const shared = seqs(alt(str("SHARED MEMORY"), str("SHARED BUFFER")), cluster, per(from, client, id));
    const database = seqs("DATABASE", cluster, per(from, client, id, using));

    const target = alt(buffer, memory, database, table, shared);

    const left = alt(new FieldSub(), new FieldSymbol());

    const source = alt(plus(altPrio(new ParameterS(), seqs(left, from), left)),
                       new Dynamic());

    const compression = seqs("COMPRESSION", alt(str("ON"), str("OFF")));
    const hint = seqs("CODE PAGE HINT", Source);

    return seqs("EXPORT", source, "TO", target, opt(compression), opt(hint));
  }

}
