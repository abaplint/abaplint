import {Visibility} from "../4_file_information/visibility";
import {TypedIdentifier, IdentifierMeta} from "./_typed_identifier";

export class ClassConstant extends TypedIdentifier {
  private readonly visibility: Visibility;

  public constructor(id: TypedIdentifier, visibility: Visibility, value: string) {
    super(id.getToken(), id.getFilename(), id.getType(), [IdentifierMeta.ReadOnly], value);
    this.visibility = visibility;
  }

  public getVisibility() {
    return this.visibility;
  }
}