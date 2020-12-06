import {seqs, optPrio, alts, altPrios, str, Expression, opts} from "../combi";
import {Default, FieldChain, TypeNameOrInfer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seqs(altPrios("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                       "TABLE");

    const foo = seqs(optPrio(seqs(table, "OF")), optPrio(str("REF TO")));

    const typeLine = str("LINE OF");

    const ret = seqs(alts(foo, typeLine),
                     TypeNameOrInfer,
                     opts(Default));

    const like = seqs("LIKE", opts("LINE OF"), FieldChain, optPrio(new Default()));

    return alts(seqs("TYPE", alts(table, ret)), like);
  }
}