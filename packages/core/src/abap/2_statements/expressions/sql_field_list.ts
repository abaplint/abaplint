import {alts, str, plus, seqs, opt, ver, tok, Expression, optPrio, altPrios} from "../combi";
import {Constant, SQLFieldName, Dynamic, Field, SQLAggregation, SQLCase} from ".";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SimpleFieldChain} from "./simple_field_chain";
import {SQLPath} from "./sql_path";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, str(",")));

    const abap = ver(Version.v740sp05, seqs(tok(WAt), new SimpleFieldChain()));

    const as = seqs("AS", Field);

    return alts("*",
                Dynamic,
                plus(seqs(altPrios(SQLAggregation,
                                   SQLCase,
                                   SQLFunction,
                                   SQLPath,
                                   SQLFieldName,
                                   abap,
                                   Constant), optPrio(as), comma)));
  }
}