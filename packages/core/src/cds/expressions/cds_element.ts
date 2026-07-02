import {CDSAggregate, CDSAnnotation, CDSArithParen, CDSArithmetics, CDSCase, CDSFunction, CDSInteger, CDSName, CDSPrefixedName, CDSString, CDSType} from ".";
import {Expression, optPrio, seq, starPrio, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    const redirected = seq(": REDIRECTED TO", optPrio(altPrio("PARENT", "COMPOSITION CHILD")), CDSName);
    const colonThing = seq(":", altPrio(CDSType, CDSName, "LOCALIZED"));

    const extensionWildcard = seq("$extension", ".", "*");
    const includeElement = seq("INCLUDE", CDSPrefixedName);
    const typedVirtual = seq("VIRTUAL", CDSName, ":", CDSType);

    const body = altPrio(extensionWildcard,
                         includeElement,
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

    const elementBody = altPrio(typedVirtual, seq(altPrio("KEY", "VIRTUAL"), body), body);

    return seq(starPrio(CDSAnnotation), elementBody, optPrio(CDSAs));
  }
}
