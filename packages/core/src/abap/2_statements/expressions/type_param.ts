import {seq, optPrios, alts, altPrios, Expression, opts} from "../combi";
import {Default, FieldChain, TypeNameOrInfer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seq(altPrios("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    const foo = seq(optPrios(seq(table, "OF")), optPrios("REF TO"));

    const typeLine = "LINE OF";

    const ret = seq(alts(foo, typeLine),
                    TypeNameOrInfer,
                    opts(Default));

    const like = seq("LIKE", opts("LINE OF"), FieldChain, optPrios(Default));

    return alts(seq("TYPE", alts(table, ret)), like);
  }
}