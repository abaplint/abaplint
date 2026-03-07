import {CDSAggregate, CDSAnnotation, CDSArithParen, CDSArithmetics, CDSCase, CDSFunction, CDSInteger, CDSName, CDSPrefixedName, CDSString, CDSType} from ".";
import {Expression, optPrio, seq, starPrio, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    const redirected = seq(": REDIRECTED TO", optPrio(altPrio("PARENT", "COMPOSITION CHILD")), CDSName);
    const colonThing = seq(":", altPrio(CDSType, CDSName, "LOCALIZED"));

    // $extension.* — extension field wildcard
    const extensionWildcard = seq("$extension", ".", "*");

    const body = altPrio(extensionWildcard,
                         CDSArithmetics,
                         CDSAggregate,
                         CDSString,
                         CDSArithParen,
                         CDSFunction,
                         CDSCast,
                         CDSCase,
                         seq("(", CDSCase, ")"),
                         seq(CDSPrefixedName, optPrio(CDSAs), optPrio(altPrio(redirected, colonThing))),
                         CDSInteger);

    // KEY/VIRTUAL keyword handling via altPrio:
    // - Try keyword form first: if keyword consumed but body fails (e.g. "virtual.Field"),
    //   altPrio backtracks to plain body (which handles "virtual" as a datasource alias prefix).
    // - This gives exactly 1 state in all cases (no exponential blowup from opt()).
    const elementBody = altPrio(seq(altPrio("KEY", "VIRTUAL"), body), body);

    // After the optional alias, allow ": redirected to" or ": Type" (for CAST/arithmetic aliases).
    // redirected is tried first so "AS alias : redirected to..." doesn't mis-parse : as colonThing.
    return seq(starPrio(CDSAnnotation), elementBody, optPrio(CDSAs), optPrio(altPrio(redirected, colonThing)));
  }
}
