import {seq, optPrio, alt, altPrio, Expression, opt} from "../combi";
import {Default, FieldChain, TypeNameOrInfer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seq(altPrio("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    const foo = seq(optPrio(seq(table, "OF")), optPrio("REF TO"));

    const typeLine = "LINE OF";

    const ret = seq(alt(foo, typeLine),
                    TypeNameOrInfer,
                    opt(Default));

    const like = seq("LIKE", opt("LINE OF"), FieldChain, optPrio(Default));

    return alt(seq("TYPE", alt(table, ret)), like);
  }
}