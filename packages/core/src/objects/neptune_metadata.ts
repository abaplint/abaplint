import {AbstractObject} from "./_abstract_object";

export class NeptuneMetadata extends AbstractObject {

  public getType(): string {
    return "ZN00";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}