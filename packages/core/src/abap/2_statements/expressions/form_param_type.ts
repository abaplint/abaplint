import {seq, opt, optPrio, altPrio, alt, ver, Expression} from "../combi";
import {Constant, FieldChain, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class FormParamType extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seq("DEFAULT", alt(Constant, FieldChain));

    const table = seq(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    const tabseq = seq(table, optPrio(seq("OF", TypeName)));

    const ret = seq(optPrio(alt("REF TO", "LINE OF")),
                    TypeName,
                    opt(def));

    const like = seq("LIKE", optPrio(alt("REF TO", "LINE OF")),
                     FieldChain);

    return alt(seq("TYPE", altPrio(tabseq, ver(Release.v916, seq("ANY", "STRUCTURE")), ret)), like);
  }
}
