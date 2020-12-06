import {seqs, optPrios, alts, altPrios, Expression, opts} from "../combi";
import {Default, FieldChain, TypeNameOrInfer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seqs(altPrios("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                       "TABLE");

    const foo = seqs(optPrios(seqs(table, "OF")), optPrios("REF TO"));

    const typeLine = "LINE OF";

    const ret = seqs(alts(foo, typeLine),
                     TypeNameOrInfer,
                     opts(Default));

    const like = seqs("LIKE", opts("LINE OF"), FieldChain, optPrios(Default));

    return alts(seqs("TYPE", alts(table, ret)), like);
  }
}