import {AbstractObject} from "./_abstract_object";

export class DataDefinition extends AbstractObject {

  public getType(): string {
    return "DDLS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
