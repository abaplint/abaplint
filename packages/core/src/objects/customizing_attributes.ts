import {AbstractObject} from "./_abstract_object";

export class CustomizingAttributes extends AbstractObject {

  public getType(): string {
    return "CUS2";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
