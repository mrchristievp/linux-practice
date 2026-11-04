# Linux Practice — classroom draft

A static, browser-based Linux skills workbook for AP Cybersecurity. Original tasks draw on the skills in the supplied CYBER.ORG Linux 101, Linux 102, and command reference materials and the JuiceMind Linux topic outline. This is not a copy of either provider's lessons. No vendor files, real credentials, or student information are included.

## Open the draft

Open `index.html` in a modern browser. The HTML includes all application code and styles. Fonts load from Google Fonts when available, with local fallbacks. No installation, account, backend, API key, or external JavaScript dependency is required.

## Publish with GitHub Pages

1. Create or choose a repository and upload `index.html` at its root.
2. In repository **Settings → Pages**, publish from your chosen branch and the root folder.
3. Open the URL GitHub supplies. All application links are relative or internal, so repository subpaths work.

Only `index.html` is required for publication. You may also upload the source files if you want to edit them in GitHub. Do not publish your original provider lesson files or class credentials.

## Included

- Seven skill modules, 28 goal-based tasks, and an independent free terminal.
- A 35-question command bank with typed recall, command writing, interpretation, and short sequences.
- Immediate practice feedback and delayed feedback in Quiz yourself mode.
- Topic selection, optional hints and solutions, supported-command reference, and VM transfer prompts.
- Browser-local saved task files, completion markers, and practice-score summaries.
- Progress export/import for changing browsers or devices.

Permissions are a separate optional module and are not selected by default in command practice. Each lab task has its own independent starting filesystem. The free terminal also has a separate filesystem. Within one task or free terminal, changes persist through navigation and refresh.

## Teaching notes

The terminal is an educational implementation of a specific command subset. It is not a full Linux system or Bash interpreter. Commands only affect the browser-local practice filesystem. `help` and `man COMMAND` describe supported syntax. Unsupported commands report an error rather than inventing real execution. Text editing uses a simple dialog, not the real nano interface. No packages, network access, scripts, or actual privileged operations run.

The quiz checks command answers by executing them against a fresh practice filesystem and comparing outputs and resulting state. This accepts common equivalent paths, symbolic permissions, and multi-step solutions. It cannot accept syntax that the practice engine does not support. Students should use the VM for the full shell and real nano behavior.

Progress and quizzes are self-study aids, not authenticated assessment records. There is no teacher dashboard, grade synchronization, secure scoring, or cross-device sync. Students can export a JSON progress file for their own use. Exports contain command history, written file contents, completion records, and practice-score summaries. Avoid entering private information.

The source cheat sheet contains items that require correction or system-specific explanation. This draft correctly distinguishes grep matching lines from occurrences, clear from history deletion, root paths from the root account, and chmod from file extensions. Later VM topics include processes, account administration (`passwd`), archives, networking, and package management. Those are not advertised as supported terminal commands in this draft.

## Edit and verify

Edit `content.mjs` for task text, explanations, and quiz prompts. Edit `engine.mjs` for terminal behavior, `app.mjs` for interactions, and `style.css` for visual styling.

Run:

```sh
node tests.mjs
node build.mjs
```

The build creates a standalone `index.html` and a matching `dist/index.html` for preview. A small local preview manifest is generated under `.openai`; it is not needed for GitHub Pages.

## Draft scope

This first draft implements command basics, navigation, files, text, search, pipes/redirection, and permissions. Processes, archive tools, real sudo/chown, real network commands, and full shell grammar are future extensions. The interface works on narrow screens, while laptops are preferable for terminal practice.
