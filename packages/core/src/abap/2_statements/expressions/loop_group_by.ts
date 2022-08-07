import {tok, plus, alt, seq, Expression, optPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";
import {LoopGroupByTarget} from "./loop_group_by_target";
import {LoopGroupByComponent} from "./loop_group_by_component";

export class LoopGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const components = seq(tok(WParenLeftW), plus(LoopGroupByComponent), tok(WParenRightW));

    const ret = seq(alt(Source, components),
                    optPrio("ASCENDING"),
                    optPrio("WITHOUT MEMBERS"),
                    LoopGroupByTarget);

    return ret;
  }
}