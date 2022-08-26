import {seq, tok, Expression, optPrio, altPrio, plusPrio} from "../combi";
import {ParenRightW, WParenLeft, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Source, FieldAssignment} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ValueBodyLines} from "./value_body_lines";

export class ValueBodyLine extends Expression {
  public getRunnable(): IStatementRunnable {

    // missing spaces caught by rule "parser_missing_space"
    const ret = seq(altPrio(tok(WParenLeftW), tok(WParenLeft)),
                    optPrio(altPrio(plusPrio(FieldAssignment), ValueBodyLines, Source)),
                    altPrio(tok(WParenRightW), tok(ParenRightW)));

    return ret;
  }
}