import {TypedIdentifier} from "./_typed_identifier";
import {ITypeDefinitions} from "./_type_definitions";

// todo: public + protected + private
export class TypeDefinitions implements ITypeDefinitions {
  private readonly list: TypedIdentifier[];

  public constructor(list: TypedIdentifier[]) {
    this.list = list;
  }

  public getAll(): readonly TypedIdentifier[] {
    return this.list;
  }

  // todo, optimize
  public getByName(name: string): TypedIdentifier | undefined {
    for (const t of this.getAll()) {
      if (t.getName().toUpperCase() === name.toUpperCase()) {
        return t;
      }
    }
    return undefined;
  }

}