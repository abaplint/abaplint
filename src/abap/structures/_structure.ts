import {IStructureRunnable} from "./_combi";

export abstract class Structure {

  public abstract getMatcher(): IStructureRunnable;

  public toRailroad(): string {
    return this.getMatcher().toRailroad();
  }

}