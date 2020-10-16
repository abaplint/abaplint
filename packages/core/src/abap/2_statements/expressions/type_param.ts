import {seq, optPrio, alt, altPrio, str, Expression, opt} from "../combi";
import {TableBody, Default, FieldChain, TypeNameOrInfer} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const table = seq(altPrio(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                      str("TABLE"));

    const foo = seq(optPrio(seq(table, str("OF"))), optPrio(str("REF TO")));

    const typeLine = str("LINE OF");

    const ret = seq(alt(foo, typeLine),
                    new TypeNameOrInfer(),
                    opt(new Default()));

    const like = seq(str("LIKE"), opt(str("LINE OF")), new FieldChain(), optPrio(new TableBody()), optPrio(new Default()));

    return alt(seq(str("TYPE"), alt(table, ret)), like);
  }
}