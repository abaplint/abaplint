import {AbstractType} from "./_abstract_type";

export interface IStructureComponent {
  name: string;
  type: AbstractType;
}

export class StructureType extends AbstractType {
  private readonly indexed: {[index: string]: AbstractType};
  private readonly components: IStructureComponent[];

  public constructor(components: IStructureComponent[], name?: string) {
    super(name);
    if (components.length === 0) {
      throw new Error("Structure does not contain any components");
    }

    this.indexed = {};
    for (const c of components) {
      const upper = c.name.toUpperCase();
      if (this.indexed[upper] !== undefined) {
        throw new Error("Structure, duplicate field name \"" + upper + "\"");
      }
      this.indexed[upper] = c.type;
    }
    this.components = components;
  }

  public getComponents(): IStructureComponent[] {
    return this.components;
  }

  public getComponentByName(name: string): AbstractType | undefined {
    return this.indexed[name.toUpperCase()];
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

  public toABAP(): string {
    const ret = this.getQualifiedName();
    if (ret) {
      return ret;
    }
    return "StructureTypetoABAPtodo";
  }

  public containsVoid() {
    return this.getComponents().some(c => { c.type.containsVoid(); });
  }
}