import {AbstractObject} from "./_abstract_object";

export class DatastoreObject extends AbstractObject {

  public getType(): string {
    return "ODSO";
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