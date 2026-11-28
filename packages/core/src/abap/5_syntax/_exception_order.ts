import {CurrentScope} from "./_current_scope";

/** Exception classes listed in order, in the CATCH statements of a TRY or in a RAISING clause, must
 * list a subclass before its super classes. Returns the super class of className that is already in listed,
 * only found when the lineage of className is known up to that class, void classes are skipped */
export function findListedSuperclass(className: string, listed: ReadonlySet<string>, scope: CurrentScope): string | undefined {
  if (listed.size === 0) {
    return undefined;
  }
  const visited = new Set<string>([className.toUpperCase()]);
  let current = scope.findClassDefinition(className);
  while (current !== undefined) {
    const superclass = current.getSuperClass()?.toUpperCase();
    if (superclass === undefined || visited.has(superclass)) {
      return undefined;
    } else if (listed.has(superclass)) {
      return superclass;
    }
    visited.add(superclass);
    current = scope.findClassDefinition(superclass);
  }
  return undefined;
}
