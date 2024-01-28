import {AbstractObject} from "./_abstract_object";

export class NeptuneRFCMapping extends AbstractObject {

  public getType(): string {
    return "ZN17";
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