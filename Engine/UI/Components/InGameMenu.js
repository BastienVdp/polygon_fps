import Component from "@Core/Component.js";
import InGameMenuContent from "./InGameMenuContent";
import Engine from "@/Engine";
import { PointLockEventEnum } from "@Enums/EventsEnum";
import { PointLockEvent, EngineEventPipe } from "@Pipes/EngineEventPipe";
/**
 * @class InGameMenu
 * @description Class to manage the in game menu UI
 */
export default class InGameMenu extends Component {
  constructor() {
    super({
      element: ".menu-in-game",
      elements: {
        menu: ".menu-in-game__nav",
        menuItems: ".menu-in-game__nav__item",
      },
    });

    this.activeTab = "equipment";
    console.log("create in game menu");
    this.initialize();
  }

  initialize() {
    this.registerEvents();
    this.createContent();
  }

  /**
   * @method createContent
   * @description Create the content panel for the in game menu
   */
  createContent() {
    this.content = new InGameMenuContent();
    this.setActiveTab(this.activeTab);
  }

  /**
   * @method registerEvents
   * @description Register the events
   * @listens PointLockEvent
   */
  registerEvents() {
    this.elements.menuItems.forEach((item) => {
      item.addEventListener("click", this.onMenuItemClick.bind(this));
    });

    EngineEventPipe.addEventListener(PointLockEvent.type, (e) =>
      this.handlePointerLockChange(e)
    );
  }

  /**
   * @method handlePointerLockChange
   * @description Handle the pointer lock change event
   */
  handlePointerLockChange(e) {
    switch (e.detail.enum) {
      case PointLockEventEnum.LOCK:
        this.hide();
        break;
      case PointLockEventEnum.UNLOCK:
        this.show();
        break;
    }
  }

  /**
   * @method onMenuItemClick
   * @description Handle the menu item click event
   * @param {Event} event
   * @listens click
   * @returns {void}
   */
  onMenuItemClick(event) {
    if (event.target.dataset.action === "resume") {
      this.engine.pointLock.lock();
      return;
    }
    this.setActiveTab(event.target.dataset.action);
  }

  /**
   * @method setActiveTab
   * @description Set the active tab
   * @param {String} tab
   */
  setActiveTab(tab) {
    this.activeTab = tab;
    this.elements.menuItems.forEach((item) => {
      item.classList.remove("active");
    });
    const activeItem = Array.from(this.elements.menuItems).find(
      (item) => item.dataset.action === tab
    );
    activeItem.classList.add("active");
    this.content.showContent(this.activeTab);
  }
}
