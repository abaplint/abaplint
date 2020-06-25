import {IStatement} from "./_statement";
import {str, seq, alt, altPrio, opt, per, plus, tok} from "../combi";
import {ParenLeft, ParenRightW} from "../../1_lexer/tokens";
import {Target, Source, Dynamic, ParameterS, FieldSub, SimpleName, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

// todo, cloud, split?
export class Export implements IStatement {

  public getMatcher(): IStatementRunnable {
    const from = seq(str("FROM"), new Source());
    const client = seq(str("CLIENT"), new Source());
    const id = seq(str("ID"), new Source());
    const using = seq(str("USING"), new Source());

    const cluster = seq(new NamespaceSimpleName(),
                        tok(ParenLeft),
                        new SimpleName(),
                        tok(ParenRightW));

    const buffer = seq(str("DATA BUFFER"), new Target());
    const memory = seq(str("MEMORY ID"), new Source());
    const table = seq(str("INTERNAL TABLE"), new Target());
    const shared = seq(alt(str("SHARED MEMORY"), str("SHARED BUFFER")), cluster, per(from, client, id));
    const database = seq(str("DATABASE"), cluster, per(from, client, id, using));

    const target = alt(buffer, memory, database, table, shared);

    const source = alt(plus(altPrio(new ParameterS(), new FieldSub())),
                       new Dynamic());

    const compression = seq(str("COMPRESSION"), alt(str("ON"), str("OFF")));
    const hint = seq(str("CODE PAGE HINT"), new Source());

    return seq(str("EXPORT"), source, opt(from), str("TO"), target, opt(compression), opt(hint));
  }

}
