import {seq, alt, altPrio, ver, AlsoIn} from "../combi";
import {EntityAssociation, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export function commonDerivedTypes(): IStatementRunnable[] {
  const entity = alt(TypeName, EntityAssociation);

  // more-specific keyword phrases (e.g. "FAILED LATE") must precede less-specific ones ("FAILED")
  return [
    ver(Release.v774, seq("FAILED LATE", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v774, seq("MAPPED LATE", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v774, seq("REPORTED LATE", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v777, seq("FAILED EARLY", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v777, seq("MAPPED EARLY", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v777, seq("REPORTED EARLY", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("FAILED", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("MAPPED", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("REPORTED", entity), {also: AlsoIn.OpenABAP}),

    ver(Release.v773, seq("FUNCTION IMPORT", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v773, seq("FUNCTION RESULT", entity), {also: AlsoIn.OpenABAP}),

    ver(Release.v773, seq("ACTION RESULT", entity), {also: AlsoIn.OpenABAP}),

    ver(Release.v781, seq("INSTANCE AUTHORIZATION KEY", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v781, seq("INSTANCE AUTHORIZATION REQUEST", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v781, seq("INSTANCE AUTHORIZATION RESULT", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v781, seq("INSTANCE FEATURES KEY", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v781, seq("INSTANCE FEATURES REQUEST", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v781, seq("INSTANCE FEATURES RESULT", entity), {also: AlsoIn.OpenABAP}),

    ver(Release.v780, seq("AUTHORIZATION RESULT", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v781, seq("AUTHORIZATION KEY", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("FEATURES RESULT", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("FEATURES KEY", entity), {also: AlsoIn.OpenABAP}),

    ver(Release.v780, seq("PERMISSIONS KEY", entity), {also: AlsoIn.OpenABAP}),

    seq("READ IMPORT", entity),
    seq("READ RESULT", entity),
    ver(Release.v915, seq("READ CHANGES", entity), {also: AlsoIn.OpenABAP}),

    seq("CREATE", entity),
    seq("DELETE", entity),
    seq("UPDATE", entity),
    ver(Release.v777, seq("LOCK", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v775, seq("KEY OF", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("DETERMINATION", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v776, seq("VALIDATION", entity), {also: AlsoIn.OpenABAP}),
    ver(Release.v778, seq("CHANGE", entity), {also: AlsoIn.OpenABAP}),
  ];
}

export function derivedTypesAlt(...extra: IStatementRunnable[]): IStatementRunnable {
  const all = [...extra, ...commonDerivedTypes()];
  const [first, second, ...rest] = all;
  return altPrio(first, second, ...rest);
}
