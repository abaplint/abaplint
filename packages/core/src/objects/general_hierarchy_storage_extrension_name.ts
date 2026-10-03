import {AbstractObject} from "./_abstract_object";

export class GeneralHierarchyStorageExtrensionName extends AbstractObject {

  public getType(): string {
    return "SHI5";
  }

  public getAllowedNaming() {
    return {
      maxLength: 15,
      allowNamespace: true,
    };
  }
}
