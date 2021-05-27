import {AbstractObject} from "./_abstract_object";

export class IACLanguageResource extends AbstractObject {

  public getType(): string {
    return "IARP";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 100,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}