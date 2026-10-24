// Ersatz fuer die frueheren UMD-Scripts (window.React / window.ReactDOM), gleiche Version 18.3.1 aus npm.
// ReactDOM bekommt wie im UMD-Build zusaetzlich createRoot/hydrateRoot.
import React from "react";
import ReactDOMBase from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";

const ReactDOM = Object.assign({}, ReactDOMBase, { createRoot, hydrateRoot });

export { React, ReactDOM };
