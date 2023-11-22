import {AbstractObject} from "./_abstract_object";

export class NeptuneAPI extends AbstractObject {

  public getType(): string {
    return "ZN02";
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