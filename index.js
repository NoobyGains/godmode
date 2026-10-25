/**
 * Package entry point. OpenCode installs GodMode as a git-backed package and
 * resolves the plugin module from here (V1 reads the named export, V2 reads
 * the default export's setup). Everything lives in .opencode/plugins/godmode.js.
 */
export { GodModePlugin, V1_MAPPING, V2_MAPPING } from './.opencode/plugins/godmode.js';
export { default } from './.opencode/plugins/godmode.js';
