import {TypedIdentifier} from "./_typed_identifier";
import {ITypeDefinitions} from "./_type_definitions";

// todo: public + protected + private
export class TypeDefinitions implements ITypeDefinitions {
  private readonly list: TypedIdentifier[];
  private readonly map: {[index: string]: TypedIdentifier} = {};

  public constructor(list: TypedIdentifier[]) {
    this.list = list;
    for (const t of list) {
// todo, can assumptions be made regarding the case of t.getName()?
      this.map[t.getName().toUpperCase()] = t;
    }
  }

  public getAll(): readonly TypedIdentifier[] {
    return this.list;
  }

  public getByName(name: string): TypedIdentifier | undefined {
    return this.map[name.toUpperCase()];
  }

}