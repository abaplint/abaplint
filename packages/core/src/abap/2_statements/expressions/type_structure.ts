import {seq, Expression, altPrio, alt, optPrio, ver} from "../combi";
import {EntityAssociation, EventName, NamespaceSimpleName, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {derivedTypesAlt} from "./_derived_types";

export class TypeStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    const entity = alt(TypeName, EntityAssociation);

    const derivedTypes = derivedTypesAlt(
      ver(Release.v779, seq("FUNCTION REQUEST", entity)),
      ver(Release.v779, seq("ACTION REQUEST", entity)),

      seq("ACTION IMPORT", Source),

      ver(Release.v781, seq("GLOBAL AUTHORIZATION REQUEST", entity)),
      ver(Release.v781, seq("GLOBAL AUTHORIZATION RESULT", entity)),
      ver(Release.v781, seq("GLOBAL FEATURES REQUEST", entity)),
      ver(Release.v781, seq("GLOBAL FEATURES RESULT", entity)),

      ver(Release.v780, seq("AUTHORIZATION REQUEST", entity)),
      ver(Release.v776, seq("FEATURES REQUEST", entity)),

      seq("PERMISSIONS REQUEST", NamespaceSimpleName),
      ver(Release.v780, seq("PERMISSIONS RESULT", entity)),

      seq("READ LINK", EntityAssociation),

      seq("HIERARCHY", NamespaceSimpleName),
      seq("EVENT", EventName),
    );

    const structure = ver(Release.v774, seq("STRUCTURE FOR", derivedTypes));

    const response = ver(Release.v776, seq("RESPONSE FOR", altPrio(
      seq("FAILED EARLY", NamespaceSimpleName),
      seq("FAILED LATE", NamespaceSimpleName),
      seq("FAILED", NamespaceSimpleName),
      seq("MAPPED EARLY", NamespaceSimpleName),
      seq("MAPPED LATE", NamespaceSimpleName),
      seq("MAPPED", NamespaceSimpleName),
      seq("REPORTED EARLY", NamespaceSimpleName),
      seq("REPORTED LATE", NamespaceSimpleName),
      seq("REPORTED", NamespaceSimpleName),
    )));

    const request = ver(Release.v778, seq("REQUEST FOR", alt("CHANGE", "DELETE"), NamespaceSimpleName));

    return seq("TYPE", altPrio(structure, response, request), optPrio("VALUE IS INITIAL"));
  }

}
