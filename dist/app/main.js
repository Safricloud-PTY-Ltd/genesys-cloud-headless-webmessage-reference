/*
 * Composition root, loaded by index.html. Everything happens in `bootstrap`: it reads the page's
 * configuration from the URL, loads Genesys Messenger (or the demo), and mounts the chat. Nothing
 * else in src/ reads page-level configuration.
 */
import { bootstrap } from "./bootstrap.js";
bootstrap({ window, document });