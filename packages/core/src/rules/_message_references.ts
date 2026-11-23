import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {Program} from "../objects";
import {IRegistry} from "../_iregistry";
import {IncludeGraph} from "../utils/include_graph";

/** runs SyntaxLogic to build the MSAG references for the objects outside dependencies,
 * dependencies are skipped unless they are the main program of a needed include, or the
 * optional dependency filter selects them */
export function buildMessageReferences(reg: IRegistry, dependencyFilter?: (obj: ABAPObject) => boolean): void {
  const needed = neededObjects(reg, dependencyFilter);
  for (const obj of [...needed, ...mainPrograms(reg, needed)]) {
    new SyntaxLogic(reg, obj).run();
  }
}

function neededObjects(reg: IRegistry, dependencyFilter?: (obj: ABAPObject) => boolean): ABAPObject[] {
  const needed: ABAPObject[] = [];
  for (const obj of reg.getObjects()) {
    if (obj instanceof ABAPObject
        && (reg.isDependency(obj) === false || dependencyFilter?.(obj) === true)) {
      needed.push(obj);
    }
  }
  return needed;
}

/** references in includes are found when running their main programs */
function mainPrograms(reg: IRegistry, objects: readonly ABAPObject[]): ABAPObject[] {
  const includes = objects.filter(o => o instanceof Program && o.isInclude() === true);
  if (includes.length === 0) {
    return [];
  }
  const graph = new IncludeGraph(reg);
  return includes.flatMap(include => graph.listMainForInclude(include.getMainABAPFile()?.getFilename()))
    .map(filename => findObject(reg, filename))
    .filter((obj): obj is ABAPObject => obj instanceof ABAPObject);
}

function findObject(reg: IRegistry, filename: string) {
  const file = reg.getFileByName(filename);
  return file ? reg.findObjectForFile(file) : undefined;
}
