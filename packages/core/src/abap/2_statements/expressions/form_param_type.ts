import {seq, opt, optPrio, altPrio, alt, ver, failCombinator, Expression} from "../combi";
import {Constant, FieldChain, TypeName, Integer} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class FormParamType extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seq("DEFAULT", alt(Constant, FieldChain));

    const table = seq(alt("STANDARD", "HASHED", "INDEX", "SORTED", "ANY"),
                      "TABLE");

    // the following are not valid FORM typings, fail instead of reading the
    // remaining words as additional parameters
    const inline = seq(alt("TABLE", "RANGE"), "OF", failCombinator());
    const tableKey = seq("WITH", failCombinator());
    const lengthDecimals = seq(alt("LENGTH", "DECIMALS"), Integer, failCombinator());

    const tabseq = seq(table,
                       optPrio(seq("OF", altPrio(seq("REF TO", failCombinator()), TypeName))),
                       optPrio(tableKey));

    const ret = seq(optPrio(alt("REF TO", "LINE OF")),
                    TypeName,
                    optPrio(lengthDecimals),
                    opt(def));

    const like = seq("LIKE", altPrio(inline,
                                     seq(table, failCombinator()),
                                     seq(optPrio(alt("REF TO", "LINE OF")), FieldChain)));

    return alt(seq("TYPE", altPrio(tabseq, ver(Release.v916, seq("ANY", "STRUCTURE")), inline, ret)), like);
  }
}
