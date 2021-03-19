import {AbstractObject} from "./_abstract_object";

export class BusinessObjectModel extends AbstractObject {

  public getType(): string {
    return "BOBF";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
