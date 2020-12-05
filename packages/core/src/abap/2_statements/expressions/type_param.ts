import {seqs, optPrio, alt, altPrio, str, Expression, opt} from "../combi";
import {Default, FieldChain, TypeNameOrInfer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seqs(altPrio(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                       "TABLE");

    const foo = seqs(optPrio(seqs(table, "OF")), optPrio(str("REF TO")));

    const typeLine = str("LINE OF");

    const ret = seqs(alt(foo, typeLine),
                     TypeNameOrInfer,
                     opt(new Default()));

    const like = seqs("LIKE", opt(str("LINE OF")), FieldChain, optPrio(new Default()));

    return alt(seqs("TYPE", alt(table, ret)), like);
  }
}