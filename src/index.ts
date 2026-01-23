import { Plugin, showMessage, Dialog } from "siyuan";
import {
  openTab,
  sql,
  createDocWithMd,
  getNotebookConf,
  renderSprig,
  lsNotebooks,
  setBlockAttrs,
} from "./api";

interface PluginSettings {
  fallbackNotebook?: string;
}

export default class DailyNavPlugin extends Plugin {
  private settings: PluginSettings = {};

  async onload() {
    console.log("Loading Daily Navigation Plugin");

    // Load settings
    await this.loadSettings();

    // Command to go to previous day (Option+Command+Left Arrow)
    this.addCommand({
      langKey: "navigateToPreviousDay",
      hotkey: "⌥⌘←",
      callback: async () => {
        await this.navigateToDailyNote(null, -1);
      },
    });

    // Command to go to next day (Option+Command+Right Arrow)
    this.addCommand({
      langKey: "navigateToNextDay",
      hotkey: "⌥⌘→",
      callback: async () => {
        await this.navigateToDailyNote(null, 1);
      },
    });
  }

  async loadSettings() {
    const data = await this.loadData("settings.json");
    this.settings = data || {};
  }

  async saveSettings() {
    await this.saveData("settings.json", this.settings);
  }

  // Override openSetting to show settings dialog
  async openSetting() {
    const dialog = new Dialog({
      title: "Daily Note Navigation Settings",
      content: `<div id="daily-nav-settings" style="padding: 20px;"></div>`,
      width: "600px",
      height: "300px",
    });

    const container = dialog.element.querySelector(
      "#daily-nav-settings",
    ) as HTMLElement;
    if (!container) return;

    container.innerHTML = `
            <div class="b3-label" style="margin-top: 16px;">
                <div class="b3-label__text" style="margin-bottom: 8px;">Fallback Notebook</div>
                <select id="fallback-notebook-select" class="b3-select fn__flex-1">
                    <option value="">Loading notebooks...</option>
                </select>
                <div class="b3-label__text fn__flex-1" style="margin-top: 8px; font-size: 12px; color: var(--b3-theme-on-surface-light);">
                    When not in a daily note, new daily notes will be created in this notebook.
                </div>
            </div>
        `;

    await this.loadNotebooksToSelect();
  }

  async loadNotebooksToSelect() {
    const select = document.getElementById(
      "fallback-notebook-select",
    ) as HTMLSelectElement;
    if (!select) return;

    try {
      const notebooks = await lsNotebooks();
      select.innerHTML = '<option value="">-- Select a notebook --</option>';

      if (notebooks && notebooks.notebooks) {
        notebooks.notebooks.forEach((nb: any) => {
          const option = document.createElement("option");
          option.value = nb.id;
          option.textContent = nb.name + (nb.closed ? " (Closed)" : "");
          if (nb.id === this.settings.fallbackNotebook) {
            option.selected = true;
          }
          select.appendChild(option);
        });
      }

      select.addEventListener("change", async () => {
        this.settings.fallbackNotebook = select.value;
        await this.saveSettings();
        showMessage("Fallback notebook saved");
      });
    } catch (error) {
      console.error("Error loading notebooks:", error);
      select.innerHTML = '<option value="">Error loading notebooks</option>';
    }
  }

  /**
   * Navigate to a daily note relative to the current date
   * @param protyle Current editor instance (may be null)
   * @param dayOffset Number of days to offset (-1 for previous, +1 for next)
   */
  async navigateToDailyNote(protyle: any, dayOffset: number) {
    try {
      // Try to get current document ID
      let currentDocId: string | null = null;

      // Try to get from active tab
      if (window.siyuan?.ws?.app?.plugins) {
        const layout = document.querySelector(
          ".layout__wnd--active .protyle.fn__flex-1:not(.fn__none)",
        );
        if (layout) {
          const dataNodeId = layout.querySelector("[data-node-id]");
          if (dataNodeId) {
            currentDocId = dataNodeId.getAttribute("data-node-id");
          }
        }
      }

      // Try to extract date and notebook from current document
      let targetDate: Date;
      let notebookId: string | null = null;
      let isCurrentDocDailyNote = false;

      if (currentDocId) {
        const extracted = await this.extractDateFromDocument(currentDocId);
        if (extracted && extracted.date) {
          // Current document is a daily note, navigate relative to it
          isCurrentDocDailyNote = true;
          notebookId = extracted.notebookId;
          targetDate = new Date(extracted.date);
          targetDate.setDate(targetDate.getDate() + dayOffset);
        } else {
          // Current document is NOT a daily note, navigate to today
          targetDate = new Date();
        }
      } else {
        // No current document, navigate to today
        targetDate = new Date();
      }

      // Format date as YYYY-MM-DD
      const targetDateStr = this.formatDate(targetDate);

      // Search for daily note with this date
      const docId = await this.findDailyNote(targetDateStr);

      if (docId) {
        // Open existing daily note (silently)
        // Note: removeCurrentTab is not specified to respect user's "open in current tab" setting
        openTab({
          app: window.siyuan.ws.app,
          doc: {
            id: docId,
            action: ["cb-get-focus"],
          },
        });
      } else {
        // Daily note doesn't exist, create it (use same notebook as current doc if available)
        const newDocId = await this.createDailyNote(targetDateStr, notebookId);
        if (newDocId) {
          // Note: removeCurrentTab is not specified to respect user's "open in current tab" setting
          openTab({
            app: window.siyuan.ws.app,
            doc: {
              id: newDocId,
              action: ["cb-get-focus"],
            },
          });
          showMessage(`Created daily note: ${targetDateStr}`);
        } else {
          showMessage(
            `Failed to create daily note: ${targetDateStr}`,
            -1,
            "error",
          );
        }
      }
    } catch (error) {
      console.error("Error navigating to daily note:", error);
      showMessage(`Error: ${error.message}`, -1, "error");
    }
  }

  /**
   * Extract date and notebook from a document (by parsing title or hpath)
   * @param docId Document ID
   * @returns Object with date and notebookId if document is a daily note, null otherwise
   */
  async extractDateFromDocument(
    docId: string,
  ): Promise<{ date: Date; notebookId: string } | null> {
    try {
      const result = await sql(
        `SELECT content, hpath, box FROM blocks WHERE id = '${docId}' AND type = 'd' LIMIT 1`,
      );

      if (result && result.length > 0) {
        const doc = result[0];

        // Try to extract date from content (title) or hpath
        const dateMatch = (doc.content || doc.hpath).match(
          /(\d{4})-(\d{2})-(\d{2})/,
        );

        if (dateMatch) {
          return {
            date: new Date(dateMatch[0]),
            notebookId: doc.box,
          };
        }
      }
    } catch (error) {
      console.warn("Could not extract date from document:", error);
    }

    // Return null if not a daily note
    return null;
  }

  /**
   * Find a daily note by date string
   * @param dateStr Date string in YYYY-MM-DD format
   * @returns Document ID if found, null otherwise
   */
  async findDailyNote(dateStr: string): Promise<string | null> {
    try {
      // Search for documents containing the date in title or path
      const result = await sql(
        `SELECT id FROM blocks
                 WHERE type = 'd'
                 AND (content LIKE '%${dateStr}%' OR hpath LIKE '%${dateStr}%')
                 LIMIT 1`,
      );

      if (result && result.length > 0) {
        return result[0].id;
      }
    } catch (error) {
      console.error("Error finding daily note:", error);
    }

    return null;
  }

  /**
   * Create a new daily note using the notebook's daily note configuration
   * @param dateStr Date string in YYYY-MM-DD format
   * @param preferredNotebookId Optional notebook ID to use (from current document)
   * @returns Document ID if created, null otherwise
   */
  async createDailyNote(
    dateStr: string,
    preferredNotebookId?: string | null,
  ): Promise<string | null> {
    try {
      let notebookId = preferredNotebookId;

      // If no preferred notebook (not in a daily note), use fallback from settings
      if (!notebookId) {
        // Try to use configured fallback notebook
        if (this.settings.fallbackNotebook) {
          notebookId = this.settings.fallbackNotebook;
        } else {
          // No fallback configured, try to find first open notebook
          const notebooks = await lsNotebooks();
          if (
            notebooks &&
            notebooks.notebooks &&
            notebooks.notebooks.length > 0
          ) {
            // Find first open notebook
            const openNotebook = notebooks.notebooks.find(
              (nb: any) => !nb.closed,
            );
            if (openNotebook) {
              notebookId = openNotebook.id;
            } else {
              // Fallback to first notebook
              notebookId = notebooks.notebooks[0].id;
            }
          }
        }
      }

      if (!notebookId) {
        throw new Error(
          "Could not determine notebook ID. Please configure a fallback notebook in settings.",
        );
      }

      // Get notebook configuration to retrieve daily note settings
      const notebookConf = await getNotebookConf(notebookId);

      if (!notebookConf) {
        throw new Error("Could not get notebook configuration");
      }

      // The daily note path is nested in conf object
      let dailyNotePath =
        notebookConf.conf?.dailyNoteSavePath || '/{{now | date "2006-01-02"}}/';

      // Replace 'now' with a specific date using toDate function
      // This allows us to create notes for dates other than today
      const dateTemplate = dailyNotePath.replace(
        /\{\{now\s*\|/g,
        `{{toDate "2006-01-02" "${dateStr}" |`,
      );

      // Render the template to get the actual path
      let renderedPath: string;
      try {
        renderedPath = await renderSprig(dateTemplate);
      } catch (error) {
        console.error("Error rendering daily note path template:", error);
        // Fallback to simple path
        renderedPath = `/${dateStr}/`;
      }

      // Create document with empty content (no heading with path)
      const docId = await createDocWithMd(notebookId, renderedPath, "");

      // Add custom attribute for daily note
      // Format: custom-dailynote-YYYYMMDD with value YYYYMMDD
      const yyyymmdd = dateStr.replace(/-/g, ""); // Convert "2026-01-17" to "20260117"
      const attrName = `custom-dailynote-${yyyymmdd}`;

      try {
        await setBlockAttrs(docId, {
          [attrName]: yyyymmdd,
        });
      } catch (error) {
        console.error("Error setting daily note attribute:", error);
      }

      return docId;
    } catch (error) {
      console.error("Error creating daily note:", error);
      return null;
    }
  }

  /**
   * Format date as YYYY-MM-DD
   * @param date Date object
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  onunload() {
    console.log("Unloading Daily Navigation Plugin");
  }

  uninstall() {
    this.removeData("settings.json").catch((e) => {
      showMessage(
        `Failed to remove settings: ${e.msg || e.message}`,
        -1,
        "error",
      );
    });
  }
}
