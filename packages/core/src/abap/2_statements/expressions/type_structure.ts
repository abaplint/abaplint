import {seq, Expression, altPrio, alt, optPrio, ver, AlsoIn} from "../combi";
import {EntityAssociation, EventName, NamespaceSimpleName, Source, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {derivedTypesAlt} from "./_derived_types";

export class TypeStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    const entity = alt(TypeName, EntityAssociation);

    const derivedTypes = derivedTypesAlt(
      ver(Release.v779, seq("FUNCTION REQUEST", entity), {also: AlsoIn.OpenABAP}),
      ver(Release.v779, seq("ACTION REQUEST", entity), {also: AlsoIn.OpenABAP}),

      seq("ACTION IMPORT", Source),

      ver(Release.v781, seq("GLOBAL AUTHORIZATION REQUEST", entity), {also: AlsoIn.OpenABAP}),
      ver(Release.v781, seq("GLOBAL AUTHORIZATION RESULT", entity), {also: AlsoIn.OpenABAP}),
      ver(Release.v781, seq("GLOBAL FEATURES REQUEST", entity), {also: AlsoIn.OpenABAP}),
      ver(Release.v781, seq("GLOBAL FEATURES RESULT", entity), {also: AlsoIn.OpenABAP}),

      ver(Release.v780, seq("AUTHORIZATION REQUEST", entity), {also: AlsoIn.OpenABAP}),
      ver(Release.v776, seq("FEATURES REQUEST", entity), {also: AlsoIn.OpenABAP}),

      seq("PERMISSIONS REQUEST", NamespaceSimpleName),
      ver(Release.v780, seq("PERMISSIONS RESULT", entity), {also: AlsoIn.OpenABAP}),

      seq("READ LINK", EntityAssociation),

      seq("HIERARCHY", NamespaceSimpleName),
      seq("EVENT", EventName),
    );

    const structure = ver(Release.v774, seq("STRUCTURE FOR", derivedTypes), {also: AlsoIn.OpenABAP});

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
    )), {also: AlsoIn.OpenABAP});

    const request = ver(Release.v778, seq("REQUEST FOR", alt("CHANGE", "DELETE"), NamespaceSimpleName), {also: AlsoIn.OpenABAP});

    return seq("TYPE", altPrio(structure, response, request), optPrio("VALUE IS INITIAL"));
  }

}
