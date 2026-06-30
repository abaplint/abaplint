import {seq, alt, altPrio, ver} from "../combi";
import {EntityAssociation, TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export function commonDerivedTypes(): IStatementRunnable[] {
  const entity = alt(TypeName, EntityAssociation);

  // more-specific keyword phrases (e.g. "FAILED LATE") must precede less-specific ones ("FAILED")
  return [
    ver(Release.v774, seq("FAILED LATE", entity)),
    ver(Release.v774, seq("MAPPED LATE", entity)),
    ver(Release.v774, seq("REPORTED LATE", entity)),
    ver(Release.v777, seq("FAILED EARLY", entity)),
    ver(Release.v777, seq("MAPPED EARLY", entity)),
    ver(Release.v777, seq("REPORTED EARLY", entity)),
    ver(Release.v776, seq("FAILED", entity)),
    ver(Release.v776, seq("MAPPED", entity)),
    ver(Release.v776, seq("REPORTED", entity)),

    ver(Release.v773, seq("FUNCTION IMPORT", entity)),
    ver(Release.v773, seq("FUNCTION RESULT", entity)),

    ver(Release.v773, seq("ACTION RESULT", entity)),

    ver(Release.v781, seq("INSTANCE AUTHORIZATION KEY", entity)),
    ver(Release.v781, seq("INSTANCE AUTHORIZATION REQUEST", entity)),
    ver(Release.v781, seq("INSTANCE AUTHORIZATION RESULT", entity)),
    ver(Release.v781, seq("INSTANCE FEATURES KEY", entity)),
    ver(Release.v781, seq("INSTANCE FEATURES REQUEST", entity)),
    ver(Release.v781, seq("INSTANCE FEATURES RESULT", entity)),

    ver(Release.v780, seq("AUTHORIZATION RESULT", entity)),
    ver(Release.v781, seq("AUTHORIZATION KEY", entity)),
    ver(Release.v776, seq("FEATURES RESULT", entity)),
    ver(Release.v776, seq("FEATURES KEY", entity)),

    ver(Release.v780, seq("PERMISSIONS KEY", entity)),

    seq("READ IMPORT", entity),
    seq("READ RESULT", entity),
    ver(Release.v915, seq("READ CHANGES", entity)),

    seq("CREATE", entity),
    seq("DELETE", entity),
    seq("UPDATE", entity),
    ver(Release.v777, seq("LOCK", entity)),
    ver(Release.v775, seq("KEY OF", entity)),
    ver(Release.v776, seq("DETERMINATION", entity)),
    ver(Release.v776, seq("VALIDATION", entity)),
    ver(Release.v778, seq("CHANGE", entity)),
  ];
}

export function derivedTypesAlt(...extra: IStatementRunnable[]): IStatementRunnable {
  const all = [...extra, ...commonDerivedTypes()];
  const [first, second, ...rest] = all;
  return altPrio(first, second, ...rest);
}
