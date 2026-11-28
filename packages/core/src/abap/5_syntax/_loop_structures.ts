import * as Structures from "../3_structures/structures";
import {IStructure} from "../3_structures/structures/_structure";

type StructureType = new () => IStructure;

const LOOPS: StructureType[] = [
  Structures.Loop,
  Structures.LoopAtScreen,
  Structures.LoopExtract,
  Structures.Do,
  Structures.While,
  Structures.Select,
  Structures.With,
  Structures.Provide,
];

/** the structure is a loop, which CONTINUE, and EXIT and CHECK in their loop meaning, refer to */
export function isLoopStructure(structure: IStructure): boolean {
  return LOOPS.some(l => structure instanceof l);
}
