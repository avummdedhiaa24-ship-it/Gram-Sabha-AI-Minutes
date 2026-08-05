"use client";

import { useEffect } from "react";

export default function DevToolsProtector() {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent Keyboard Shortcuts for DevTools, View Source, and Save
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Shift+I / Cmd+Opt+I (Inspect)
      // Ctrl+Shift+J / Cmd+Opt+J (Console)
      // Ctrl+Shift+C / Cmd+Opt+C (Element Selector)
      if (
        (metaOrCtrl && (e.altKey || e.shiftKey) && ["I", "J", "C", "i", "j", "c"].includes(e.key)) ||
        (metaOrCtrl && (e.shiftKey) && ["I", "J", "C", "i", "j", "c"].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+U (View Source) & Ctrl+S / Cmd+S (Save Page)
      if (metaOrCtrl && ["u", "U", "s", "S", "p", "P"].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Prevent Dragging elements
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 4. Anti-Debugging & DevTools Detection Trap
    const debuggerInterval = setInterval(() => {
      const startTime = performance.now();
      // 'debugger' statement pauses script execution if DevTools is open
      (function () {
        return false;
      })
      ["constructor"]("debugger")();

      const endTime = performance.now();
      if (endTime - startTime > 100) {
        // DevTools opened and paused on debugger
        document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a;color:#ef4444;font-family:sans-serif;font-size:24px;font-weight:bold;'>Security Warning: Developer Tools are restricted on this portal.</div>";
      }
    }, 1000);

    // 5. Console Cleansing
    if (process.env.NODE_ENV === "production") {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
    }

    // Attach Event Listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      clearInterval(debuggerInterval);
    };
  }, []);

  return null;
}
