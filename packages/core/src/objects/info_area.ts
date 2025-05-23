import {AbstractObject} from "./_abstract_object";

export class InfoArea extends AbstractObject {

  public getType(): string {
    return "AREA";
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