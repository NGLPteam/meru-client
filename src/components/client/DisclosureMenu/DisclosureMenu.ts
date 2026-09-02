/**
 * Standalone disclosure: a single toggle and the panel it controls.
 *
 * Contract: the toggle is `button[aria-controls]`, the panel is the element
 * with that id. Open state is reflected as `aria-expanded` on the toggle and
 * `data-open`/`inert` on the panel; `data-open` is also set on this element
 * for styling hooks. Escape, focus leaving the element, clicks outside it,
 * and clicks on `[data-close-menu]` items inside the panel close it.
 */
class DisclosureMenu extends HTMLElement {
  abortController = new AbortController();
  private open = false;

  get toggle() {
    return this.querySelector(
      "button[aria-controls]",
    ) as HTMLButtonElement | null;
  }

  get panel() {
    const id = this.toggle?.getAttribute("aria-controls");

    return id ? this.querySelector<HTMLElement>(`#${id}`) : null;
  }

  connectedCallback() {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.toggle?.addEventListener("click", this.handleToggleClick, {
      signal,
    });
    this.panel?.addEventListener("click", this.handlePanelClick, { signal });
    this.addEventListener("focusout", this.handleFocusOut, { signal });
    this.addEventListener("keydown", this.handleKeyDown, { signal });
    window.addEventListener("click", this.handleClickOutside, { signal });

    this.update();
  }

  disconnectedCallback() {
    this.abortController.abort();
  }

  setOpen(value: boolean) {
    this.open = value;
    this.update();
  }

  update() {
    this.toggle?.setAttribute("aria-expanded", this.open ? "true" : "false");
    this.panel?.toggleAttribute("inert", !this.open);
    this.panel?.toggleAttribute("data-open", this.open);
    this.toggleAttribute("data-open", this.open);
  }

  handleToggleClick = () => {
    this.setOpen(!this.open);
  };

  handlePanelClick = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest("[data-close-menu]")) {
      this.setOpen(false);
    }
  };

  handleFocusOut = (event: FocusEvent) => {
    if (!!event.relatedTarget && !this.contains(event.relatedTarget as Node)) {
      this.setOpen(false);
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.open) {
      event.stopPropagation();
      this.setOpen(false);
      // The panel becomes inert; return focus to the toggle.
      this.toggle?.focus();
    }
  };

  handleClickOutside = (event: MouseEvent) => {
    if (!this.contains(event.target as Node)) {
      this.setOpen(false);
    }
  };
}

export default DisclosureMenu;
