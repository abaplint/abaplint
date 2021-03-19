import {AbstractObject} from "./_abstract_object";

export class FormObjectInterface extends AbstractObject {

  public getType(): string {
    return "SFPI";
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
