import {AbstractType} from "./_abstract_type";

export interface IStructureComponent {
  name: string;
  type: AbstractType;
}

export class StructureType extends AbstractType {
  private readonly components: IStructureComponent[];

  public constructor(components: IStructureComponent[]) {
    super();
    if (components.length === 0) {
      throw new Error("Structure does not contain any components");
    }
    this.components = components;
  }

  public getComponents(): IStructureComponent[] {
    return this.components;
  }

  public toText() {
    const compo: string[] = [];
    for (const c of this.components) {
      compo.push(c.name + " TYPE " + c.type.toText());
    }
    return "Structure: {" + compo.join(", ") + "}";
  }
}