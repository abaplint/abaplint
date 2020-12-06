import {alt, plus, seq, opt, vers, tok, Expression, optPrio, altPrio} from "../combi";
import {Constant, SQLFieldName, Dynamic, Field, SQLAggregation, SQLCase} from ".";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SimpleFieldChain} from "./simple_field_chain";
import {SQLPath} from "./sql_path";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(vers(Version.v740sp05, ","));

    const abap = vers(Version.v740sp05, seq(tok(WAt), SimpleFieldChain));

    const as = seq("AS", Field);

    return alt("*",
               Dynamic,
               plus(seq(altPrio(SQLAggregation,
                                SQLCase,
                                SQLFunction,
                                SQLPath,
                                SQLFieldName,
                                abap,
                                Constant), optPrio(as), comma)));
  }
}