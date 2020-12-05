import {seqs, str, opt, optPrio, altPrio, alt, Expression} from "../combi";
import {Constant, FieldChain, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class FormParamType extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seqs("DEFAULT", alt(new Constant(), new FieldChain()));

    const table = seqs(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                       "TABLE");

    const tabseq = seqs(table, optPrio(seqs("OF", TypeName)));

    const ret = seqs(optPrio(alt(str("REF TO"), str("LINE OF"))),
                     TypeName,
                     opt(def));

    const like = seqs("LIKE", optPrio(alt(str("REF TO"), str("LINE OF"))),
                      FieldChain);

    return alt(seqs("TYPE", altPrio(tabseq, ret)), like);
  }
}
