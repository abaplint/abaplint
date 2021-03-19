import {AbstractObject} from "./_abstract_object";

export class GeneralStorageStructure extends AbstractObject {

  public getType(): string {
    return "SHI3";
  }

  public getAllowedNaming() {
    return {
      maxLength: 32,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}