import {CDSAggregate, CDSAnnotation, CDSArithParen, CDSArithmetics, CDSCase, CDSFunction, CDSInteger, CDSName, CDSParameters, CDSParametersSelect, CDSPrefixedName, CDSString, CDSType} from ".";
import {Expression, optPrio, plusPrio, seq, starPrio, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAs} from "./cds_as";
import {CDSCast} from "./cds_cast";

export class CDSElement extends Expression {
  public getRunnable(): IStatementRunnable {
    const redirected = seq(": REDIRECTED TO", optPrio(altPrio("PARENT", "COMPOSITION CHILD")), CDSName);
    const colonThing = seq(":", altPrio(CDSType, CDSName, "LOCALIZED"));

    const extensionWildcard = seq("$extension", ".", "*");
    const excludingNames = seq(CDSName, starPrio(seq(",", CDSName)));
    const excluding = seq("EXCLUDING", "{", excludingNames, "}");
    const includeElement = seq("INCLUDE", CDSPrefixedName, optPrio(excluding), optPrio("SIGNATURE ONLY"));
    const typedVirtual = seq("VIRTUAL", CDSName, ":", CDSType);

    const pathSegment = seq(".", altPrio(CDSString, CDSName, "*"), optPrio(altPrio(CDSParametersSelect, CDSParameters)));
    const funcWithPath = seq(CDSFunction, plusPrio(pathSegment));

    const body = altPrio(extensionWildcard,
                         includeElement,
                         CDSArithmetics,
                         CDSAggregate,
                         CDSString,
                         CDSArithParen,
                         funcWithPath,
                         CDSFunction,
                         CDSCast,
                         CDSCase,
                         seq("(", CDSCase, ")"),
                         seq(CDSPrefixedName, optPrio(CDSAs), optPrio(altPrio(redirected, colonThing))),
                         CDSInteger);

    const elementBody = altPrio(typedVirtual, seq(altPrio("KEY", "VIRTUAL"), body), body);

    return seq(starPrio(CDSAnnotation), elementBody, optPrio(CDSAs), starPrio(CDSAnnotation));
  }
}
