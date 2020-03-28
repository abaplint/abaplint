import {AbstractObject} from "./_abstract_object";

export class SharedMemory extends AbstractObject {

  public getType(): string {
    return "SHMA";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}