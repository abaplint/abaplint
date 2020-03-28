import {IStructureRunnable} from "./_structure_runnable";

export interface IStructure {
  getMatcher(): IStructureRunnable;
}