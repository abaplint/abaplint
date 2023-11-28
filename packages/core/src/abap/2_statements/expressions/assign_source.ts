import {seq, alt, tok, opt, Expression, ver} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";
import {Dynamic} from "./dynamic";
import {Field} from "./field";
import {SimpleSource3} from "./simple_source3";
import {Version} from "../../../version";

export class AssignSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const component = seq("COMPONENT",
                          alt(SimpleSource3, ver(Version.v740sp02, Source)),
                          "OF STRUCTURE",
                          Source);

    const tableField = seq("TABLE FIELD", alt(Source, Dynamic));

    const arrow = alt(tok(InstanceArrow), tok(StaticArrow));

    const source = alt(seq(Source, opt(seq(arrow, Dynamic))),
                       component,
                       tableField,
                       seq(Dynamic, opt(seq(arrow, alt(Field, Dynamic)))));

    return source;
  }
}