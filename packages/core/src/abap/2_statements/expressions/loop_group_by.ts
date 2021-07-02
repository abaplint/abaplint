import {tok, opt, plus, alt, seq, Expression, optPrio} from "../combi";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {ComponentName} from "./component_name";
import {ComponentCompare} from "./component_compare";
import {Target} from "./target";
import {FSTarget} from "./fstarget";
import {Source} from "./source";

export class LoopGroupBy extends Expression {
  public getRunnable(): IStatementRunnable {

    const into = seq(opt("REFERENCE"), "INTO", Target);

    const assigning = seq("ASSIGNING", FSTarget);

    const groupSize = seq(ComponentName, "=", "GROUP SIZE");

    const components = seq(tok(WParenLeftW), plus(alt(ComponentCompare, groupSize)), tok(WParenRightW));

    const ret = seq(alt(Source, components),
                    optPrio("ASCENDING"),
                    optPrio("WITHOUT MEMBERS"),
                    optPrio(alt(into, assigning)));

    return ret;
  }
}