import {alt, tok, seq, Expression, ver, plus, optPrio} from "../combi";
import {Version} from "../../../version";
import {TypeNameOrInfer, Source, ParameterListS} from ".";
import {ParenLeftW, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {FieldAssignment} from "./field_assignment";

// note: this can also be new data reference
export class NewObject extends Expression {
  public getRunnable(): IStatementRunnable {
    const lines = plus(seq(tok(WParenLeftW), Source, tok(WParenRightW)));
    const linesFields = plus(seq(tok(WParenLeftW), plus(FieldAssignment), tok(WParenRightW)));

    const neww = seq("NEW",
                     TypeNameOrInfer,
                     tok(ParenLeftW),
                     optPrio(alt(Source, ParameterListS, lines, linesFields)),
                     ")");

    return ver(Version.v740sp02, neww);
  }
}