import {TypedIdentifier} from "./_typed_identifier";
import {ITypeDefinitions, TypeDefinitionsEntry} from "./_type_definitions";

export class TypeDefinitions implements ITypeDefinitions {
  private readonly list: TypeDefinitionsEntry[];
  private readonly map: {[index: string]: TypeDefinitionsEntry} = {};

  public constructor(list: TypeDefinitionsEntry[]) {
    this.list = list;
    for (const t of list) {
// todo, can assumptions be made regarding the case of t.getName()?
      this.map[t.type.getName().toUpperCase()] = t;
    }
  }

  public getAll(): TypeDefinitionsEntry[] {
    return this.list;
  }

  public getByName(name: string): TypedIdentifier | undefined {
    return this.map[name.toUpperCase()]?.type;
  }

}