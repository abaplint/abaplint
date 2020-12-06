import {seq, opt, optPrios, altPrio, alt, Expression} from "../combi";
import {Constant, FieldChain, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParamType extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seq("DEFAULT", alt(Constant, FieldChain));

    const table = seq(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    const tabseq = seq(table, optPrios(seq("OF", TypeName)));

    const ret = seq(optPrios(alt("REF TO", "LINE OF")),
                    TypeName,
                    opt(def));

    const like = seq("LIKE", optPrios(alt("REF TO", "LINE OF")),
                     FieldChain);

    return alt(seq("TYPE", altPrio(tabseq, ret)), like);
  }
}
