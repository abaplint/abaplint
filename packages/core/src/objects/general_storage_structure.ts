import {AbstractObject} from "./_abstract_object";

export class GeneralStorageStructure extends AbstractObject {

  public getType(): string {
    return "SHI3";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}