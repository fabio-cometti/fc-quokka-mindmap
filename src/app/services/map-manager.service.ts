import { ElementRef, Injectable } from "@angular/core";
import { MapNode } from "../models/map-item";
import { v4 as uuidv4 } from "uuid";
import { BehaviorSubject, Subject } from "rxjs";
import { toPng, toBlob, toSvg } from "html-to-image";
import { downloadURI } from "../core/utils";

@Injectable({
  providedIn: "root",
})
export class MapManagerService {
  private cssIndex = 0;
  private rootNode!: MapNode;
  private container!: ElementRef;

  /**
   * Subject for manage map modifications
   */
  private changedMapSubject = new Subject<void>();
  public mapChanged$ = this.changedMapSubject.asObservable();

  /**
   * Subject for disconnect all
   */
  private disconnectAllSubject = new Subject<void>();
  public disconnectAll$ = this.disconnectAllSubject.asObservable();

  /**
   * Subject for disconnect all
   */
  private nodeRefreshedSubject = new Subject<string>();
  public nodeRefreshed$ = this.nodeRefreshedSubject.asObservable();

  /**
   * Subject for disconnect node
   */
  private disconnectNodeSubject = new Subject<string>();
  public disconnectNode$ = this.disconnectNodeSubject.asObservable();

  /**
   * Subject for disconnect node
   */
  private moveNodeSubject = new Subject<string>();
  public moveNode$ = this.moveNodeSubject.asObservable();

  /**
   * Subject for all IDs
   */
  private allIdsSubject = new BehaviorSubject<string[]>([]);
  public allIds$ = this.allIdsSubject.asObservable();

  /**
   * Subject for mocking node
   */
  private mockingNodeSubject = new Subject<{
    parentId: string;
    originalId: string;
    cloneId: string;
  }>();
  public mockingNode$ = this.mockingNodeSubject.asObservable();

  /**
   * Subject for mocking node
   */
  private demockingNodeSubject = new Subject<{
    parentId: string;
    originalId: string;
    cloneId: string;
  }>();
  public demockingNode$ = this.demockingNodeSubject.asObservable();

  constructor() {}

  /**
   *
   * @param container Set the main container for the map
   */
  setContainer(container: ElementRef): void {
    if (!this.container) {
      this.container = container;
    } else {
      throw "Container already set for the map";
    }
  }

  /**
   * Force node refresh
   * @param parentNode
   */
  refreshNode(id: string): void {
    this.nodeRefreshedSubject.next(id);
  }

  /**
   * Emit an event of map changed
   */
  mapChanged(): void {
    this.changedMapSubject.next();
    this.allIdsSubject.next(this.getAllIds(this.rootNode));
  }

  /* #region  Node manipulation */

  addChild(parentNode: MapNode): MapNode {
    const newNode = this.getNodeChild(parentNode);
    if (newNode.isFirstLevel && newNode.position == "left") {
      parentNode.children.splice(0, 0, newNode);
    } else {
      parentNode.children.push(newNode);
    }
    this.mapChanged();
    return newNode;
  }

  /**
   * Delete a child node
   */
  deleteChild(id: string, parentNode: MapNode): void {
    const deletedNode = parentNode.children.filter((i) => i.id === id)[0];
    this.recursiveDeletion(deletedNode);

    parentNode.children = parentNode.children.filter((i) => i.id !== id) || [];
    this.disconnectNodeSubject.next(id);
    this.mapChanged();
  }

  /**
   * Recursively delete a node and all his children
   * @param node the node
   */
  private recursiveDeletion(node: MapNode): void {
    node.children.forEach((element) => {
      this.recursiveDeletion(element);
      this.disconnectNodeSubject.next(element.id);
    });
  }

  /**
   * Move a branch from left to right or viceversa
   */
  moveChild(id: string, parentNode: MapNode): void {
    const movedNode = parentNode.children.filter((i) => i.id === id)[0];
    this.recursiveMove(movedNode);
    this.disconnectNodeSubject.next(id);
    this.mapChanged();
  }

  /**
   * Recursively move a node from left to right or vice-versa
   * @param node the node
   */
  private recursiveMove(node: MapNode): void {
    node.position = node.position === "left" ? "right" : "left";
    node.children.forEach((element) => {
      this.recursiveMove(element);
      this.disconnectNodeSubject.next(element.id);
    });
  }

  sortNode(id: string, direction: "up" | "down", parentNode: MapNode): void {
    const index = parentNode.children.map((n) => n.id).indexOf(id);
    const position = parentNode.children[index].position;

    let swapIndex = index;
    if (direction === "up") {
      const swapId = parentNode.children
        .filter((n, i) => n.position === position && i < index)
        .pop()?.id;
      swapIndex = parentNode.children.map((n) => n.id).indexOf(swapId || "");
    } else {
      const swapId = parentNode.children.filter(
        (n, i) => n.position === position && i > index
      )[0]?.id;
      swapIndex = parentNode.children.map((n) => n.id).indexOf(swapId || "");
    }

    if (index !== swapIndex) {
      const temp = parentNode.children[index];
      parentNode.children[index] = parentNode.children[swapIndex];
      parentNode.children[swapIndex] = temp;
    }

    parentNode.children = [...parentNode.children];
    this.mapChanged();
  }

  /**
   * Disconnect all the connections from all nodes
   */
  disconnectAll(): void {
    this.disconnectAllSubject.next();
  }
  
  /* #endregion */

  /* #region Mocking */

  mockNode(mapNode: MapNode): void {
    const parent = this.findParentNode(mapNode.parentId || "", this.rootNode);
    const id = mapNode.id;
    mapNode.id = "T-" + mapNode.id;

    const index = parent!.children.findIndex((n) => n.id === id);
    if (index > -1) {
      parent?.children.splice(index + 1, 0, mapNode);
      this.mockingNodeSubject.next({
        parentId: parent?.id || "",
        originalId: id,
        cloneId: mapNode.id,
      });
      this.refreshNode(parent?.id || "");
    }
  }

  removeMockNode(mapNode: MapNode): void {
    const parent = this.findParentNode(mapNode.parentId || "", this.rootNode);
    parent!.children = parent!.children.filter((n) => !n.temp);
    mapNode.uniqueIdentifier = uuidv4();
    this.demockingNodeSubject.next({
      parentId: parent?.id || "",
      originalId: mapNode.id,
      cloneId: "T-" + mapNode.id,
    });
    this.refreshNode(parent?.id || "");
  }

  removeAllMockNodes(mapNode: MapNode | null = null): void {
    if (mapNode == null) {
      mapNode = this.rootNode;
    }
    mapNode.children = mapNode.children.filter((n) => !n.temp);
    this.refreshNode(mapNode.id);

    mapNode.children.forEach((element) => {
      this.removeAllMockNodes(element);
    });
  }

  /* #endregion */

  /* #region  New Node */

  /**
   * Get a new root node for a new map
   * @param title The title of the root idea
   * @returns the root node
   */
  getNewRootNode(title: string | null = null): MapNode {
    this.rootNode = {
      id: uuidv4(),
      title: title || "The root",
      isRoot: true,
      position: "center",
      parentId: undefined,
      children: [],
      isFirstLevel: false,
      isNew: true,
      notes: "",
      temp: false,
    };

    return this.rootNode;
  }

  /**
   * Set a new root node for a new map if not already defined
   * @param title The title of the root idea
   * @returns the root node
   */
  setNewRootNode(root: MapNode): MapNode {
    this.rootNode = root;
    return this.rootNode;
  }

  /**
   * Create a new child node
   * @param position Position of the node respect to the root idea. It can be 'left' or 'right' or 'center'
   * @param parent  The parent node. Actually this parameter is unused
   * @param css The CSS class of the node
   * @param isNew A boolean for just added nodes.
   * @returns a new MapNode
   */
  getNewNode(
    position: "left" | "right" | "center",
    parentId: string | undefined = undefined,
    css: string | undefined = undefined,
    isNew = false,
    isFirstLevel: boolean = false
  ): MapNode {
    return {
      id: uuidv4(),
      title: "New",
      isRoot: false,
      css: css,
      position: position,
      parentId: parentId,
      children: [],
      isFirstLevel: isFirstLevel,
      isNew: isNew,
      notes: "",
    };
  }

  private getNodeChild(parentNode: MapNode): MapNode {
    const position = this.getNewNodePosition(parentNode);
    const css = this.getNewNodeCSS(parentNode);
    const newNode = this.getNewNode(
      position,
      parentNode.id,
      css,
      true,
      parentNode.isRoot
    );
    return newNode;
  }

  private getNewNodePosition(parentNode: MapNode): "left" | "right" | "center" {
    if (parentNode.isRoot) {
      const leftNodes = parentNode.children.filter(
        (i) => i.position === "left"
      ).length;
      const rightNodes = parentNode.children.filter(
        (i) => i.position === "right"
      ).length;

      if (rightNodes < 4) {
        return "right";
      } else if (leftNodes < 4) {
        return "left";
      } else {
        return leftNodes >= rightNodes ? "right" : "left";
      }
    } else {
      return parentNode.position;
    }
  }

  private getNewNodeCSS(parentNode: MapNode): string {
    const css = parentNode.isRoot
      ? "conn" + (this.cssIndex++ % 10)
      : parentNode.css || "";
    return css;
  }

  /* #endregion */

  /* #region  Map exporting */

  /**
   * Generate an image from the map in the container and open a new tab with the preview of the image
   */
  preview(): void {
    const containerElement = this.container.nativeElement;

    toBlob(containerElement as HTMLElement, {
      width: containerElement.scrollWidth + 100,
      height: containerElement.scrollHeight + 50,
      backgroundColor: "#303030",
    }).then(function (blob) {
      const blobUrl = URL.createObjectURL(blob!);
      window.open(blobUrl, "_blank");
    });
  }

  /**
   * Export the current map as a PNG image
   */
  exportAsPng(): void {
    const containerElement = this.container.nativeElement;

    toPng(containerElement as HTMLElement, {
      width: containerElement.scrollWidth + 100,
      height: containerElement.scrollHeight + 50,
      backgroundColor: "#303030",
    }).then(function (dataUrl) {
      downloadURI(dataUrl, "map.png");
    });
  }

  /**
   * Export the current map as a SVG image
   */
  exportAsSVG(): void {
    const containerElement = this.container.nativeElement;

    toSvg(containerElement as HTMLElement, {
      width: containerElement.scrollWidth + 100,
      height: containerElement.scrollHeight + 50,
      backgroundColor: "#303030",
    }).then(function (dataUrl) {
      downloadURI(dataUrl, "map.svg");
    });
  }

  /* #endregion */

  private getAllIds(mapNode: MapNode): string[] {
    let ids: string[] = [];

    mapNode.children.forEach((element) => {
      ids = ids.concat(this.getAllIds(element));
    });
    ids.push("L-" + mapNode.id);
    return ids;
  }

  private findParentNode(parentId: string, mapNode: MapNode): MapNode | null {
    if (mapNode.id === parentId) {
      return mapNode;
    } else if (mapNode.children.length > 0) {
      let node: MapNode | null = null;
      for (let i = 0; i < mapNode.children.length; i++) {
        node = this.findParentNode(parentId, mapNode.children[i]);
        if (!!node) {
          break;
        }
      }
      return node;
    } else {
      return null;
    }
  }
}
