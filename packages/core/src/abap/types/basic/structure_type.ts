import {AbstractType} from "./_abstract_type";

export interface IStructureComponent {
  name: string;
  type: AbstractType;
}

export class StructureType implements AbstractType {
  private readonly components: IStructureComponent[];

  public constructor(components: IStructureComponent[]) {
    if (components.length === 0) {
      throw new Error("Structure does not contain any components");
    }
// todo, check for duplicate names
    this.components = components;
  }

  public getComponents(): IStructureComponent[] {
    return this.components;
  }

  public getComponentByName(name: string): AbstractType | undefined {
    for (const c of this.getComponents()) {
      if (c.name.toUpperCase() === name.toUpperCase()) {
        return c.type;
      }
    }
    return undefined;
  }

  public toText(level: number) {
    const compo: string[] = [];
    for (const c of this.components) {
      compo.push(c.name + " TYPE " + c.type.toText(level + 1));
    }
    const spaces = "  ".repeat(level);
    return "Structure\n" + spaces + "* " + compo.join("\n" + spaces + "* ");
  }

  public isGeneric() {
    return false;
  }

  public containsVoid() {
    return this.getComponents().some(c => c.type.containsVoid());
  }

  public getIdentifier() {
    return undefined;
  }
}