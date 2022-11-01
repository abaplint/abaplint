import {AbstractObject} from "./_abstract_object";

export class IAMApp extends AbstractObject {

  public getType(): string {
    return "SIA6";
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