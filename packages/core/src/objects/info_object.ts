import {AbstractObject} from "./_abstract_object";

export class InfoObject extends AbstractObject {

  public getType(): string {
    return "IOBJ";
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