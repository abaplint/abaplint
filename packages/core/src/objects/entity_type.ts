import {AbstractObject} from "./_abstract_object";

export class EntityType extends AbstractObject {

  public getType(): string {
    return "UENO";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 200,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}