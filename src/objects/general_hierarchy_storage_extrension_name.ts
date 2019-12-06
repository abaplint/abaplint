import {AbstractObject} from "./_abstract_object";

export class GeneralHierarchyStorageExtrensionName extends AbstractObject {

  public getType(): string {
    return "SHI5";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}