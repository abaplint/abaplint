import {AbstractObject} from "./_abstract_object";

export type ParsedBehaviorDefinition = {
  /** entities defined in the behavior definition, alias is undefined if not specified */
  entities: {name: string, alias: string | undefined}[];
};

export class BehaviorDefinition extends AbstractObject {
  private parsedData: ParsedBehaviorDefinition | undefined = undefined;

  public getType(): string {
    return "BDEF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public setDirty(): void {
    this.parsedData = undefined;
    super.setDirty();
  }

  public findSourceFile() {
    return this.getFiles().find(f => f.getFilename().endsWith(".asbdef"));
  }

  public listEntities(): readonly {name: string, alias: string | undefined}[] {
    return this.parseSource().entities;
  }

  /** finds the entity name for a given alias, undefined if the alias is not defined */
  public findEntityNameByAlias(alias: string): string | undefined {
    const upper = alias.toUpperCase();
    for (const entity of this.listEntities()) {
      if (entity.alias?.toUpperCase() === upper) {
        return entity.name;
      }
    }
    return undefined;
  }

/////////////////////////

  private parseSource(): ParsedBehaviorDefinition {
    if (this.parsedData !== undefined) {
      return this.parsedData;
    }

    this.parsedData = {entities: []};

    const raw = this.findSourceFile()?.getRaw();
    if (raw === undefined) {
      return this.parsedData;
    }

    // BDEF uses "//" for line comments
    const stripped = raw.replace(/\/\/.*$/gm, "");
    // eg. "define behavior for ZI_Booking alias Booking", also "define abstract behavior for ..."
    const regex = /\bdefine\s+(?:\w+\s+)*?behavior\s+for\s+([\w/]+)(?:\s+alias\s+(\w+))?/gi;
    let match = regex.exec(stripped);
    while (match !== null) {
      this.parsedData.entities.push({name: match[1], alias: match[2]});
      match = regex.exec(stripped);
    }

    return this.parsedData;
  }
}
