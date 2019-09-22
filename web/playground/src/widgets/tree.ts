import {Message} from '@phosphor/messaging';
import {Widget} from '@phosphor/widgets';
import {FileSystem, IFileSubscriber} from '../filesystem';

export class TreeWidget extends Widget implements IFileSubscriber {
  private fileSystem: FileSystem;

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    return node;
  }

  constructor(fileSystem: FileSystem) {
    super({ node: TreeWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");
    fileSystem.register(this);
    this.fileSystem = fileSystem;
  }

  public notify(): void {
    this.updateList();
  }

  protected onActivateRequest(msg: Message): void {
  }

  protected onAfterAttach() {
    this.updateList();
  }

  private updateList() {
    let content = document.createElement('div');
    this.addClass("content");
    let input = document.createElement('tt');
    for (const f of this.fileSystem.getFiles()) {
      input.innerHTML = input.innerHTML + "<br>" + f.filename;
    }
    content.appendChild(input);

    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }

    this.node.appendChild(content);
  }
}