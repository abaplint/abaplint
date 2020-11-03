import {alt, str, plus, seq, opt, ver, tok, Expression, optPrio, altPrio} from "../combi";
import {Constant, SQLFieldName, Dynamic, Field, SQLAggregation, SQLCase} from ".";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SimpleFieldChain} from "./simple_field_chain";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, str(",")));

    const abap = ver(Version.v740sp05, seq(tok(WAt), new SimpleFieldChain()));

    const as = seq(str("AS"), new Field());

    return alt(str("*"),
               new Dynamic(),
               plus(seq(altPrio(new SQLAggregation(),
                                new SQLCase(),
                                new SQLFunction(),
                                new SQLFieldName(),
                                abap,
                                new Constant()), optPrio(as), comma)));
  }
}