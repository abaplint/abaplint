import {tok, plus, alt, seq, Expression, optPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentName} from "./component_name";
import {ComponentCompare} from "./component_compare";
import {Source} from "./source";
import {LoopGroupByTarget} from "./loop_group_by_target";

export class LoopGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {
    const groupSize = seq(ComponentName, "=", "GROUP SIZE");

    const components = seq(tok(WParenLeftW), plus(alt(ComponentCompare, groupSize)), tok(WParenRightW));

    const ret = seq(alt(Source, components),
                    optPrio("ASCENDING"),
                    optPrio("WITHOUT MEMBERS"),
                    LoopGroupByTarget);

    return ret;
  }
}