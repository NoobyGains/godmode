import fs from 'fs';
import path from 'path';
// Parse YAML header block from a protocol definition file
function parseFrontmatter(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const rows = raw.split('\n');

        let insideHeader = false;
        let label = '';
        let summary = '';

        for (const row of rows) {
            if (row.trim() === '---') {
                if (insideHeader) break;
                insideHeader = true;
                continue;
            }

            if (insideHeader) {
                const found = row.match(/^(\w+):\s*(.*)$/);
                if (found) {
                    const [, field, val] = found;
                    switch (field) {
                        case 'name':
                            label = val.trim();
                            break;
                        case 'description':
                            summary = val.trim();
                            break;
                    }
                }
            }
        }

        return { name: label, description: summary };
    } catch (err) {
        return { name: '', description: '' };
    }
}

// Recursively locate all SKILL.md protocol definitions within a directory tree
function discoverProtocols(rootDir, origin, depthLimit = 3) {
    const protocols = [];

    if (!fs.existsSync(rootDir)) return protocols;

    function traverse(dir, level) {
        if (level > depthLimit) return;

        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const itemPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Look for a protocol definition in this folder
                const defFile = path.join(itemPath, 'SKILL.md');
                if (fs.existsSync(defFile)) {
                    const { name, description } = parseFrontmatter(defFile);
                    protocols.push({
                        path: itemPath,
                        skillFile: defFile,
                        name: name || item.name,
                        description: description || '',
                        sourceType: origin
                    });
                }

                // Continue searching deeper
                traverse(itemPath, level + 1);
            }
        }
    }

    traverse(rootDir, 0);
    return protocols;
}

// Resolve a protocol name to its definition file, with user protocols shadowing built-in ones
function resolveProtocolPath(protocolName, builtinDir, userDir) {
    // Detect explicit godmode: namespace prefix
    const isBuiltinForced = protocolName.startsWith('godmode:');
    const cleanName = isBuiltinForced ? protocolName.replace(/^godmode:/, '') : protocolName;

    // Reject path traversal attempts (e.g., "../../../etc/passwd")
    if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) {
        return null;
    }

    // User protocols take priority unless explicitly requesting built-in
    if (!isBuiltinForced && userDir) {
        const userPath = path.join(userDir, cleanName);
        const userDefFile = path.join(userPath, 'SKILL.md');
        if (fs.existsSync(userDefFile)) {
            return {
                skillFile: userDefFile,
                sourceType: 'personal',
                skillPath: cleanName
            };
        }
    }

    // Fall back to built-in protocols
    if (builtinDir) {
        const builtinPath = path.join(builtinDir, cleanName);
        const builtinDefFile = path.join(builtinPath, 'SKILL.md');
        if (fs.existsSync(builtinDefFile)) {
            return {
                skillFile: builtinDefFile,
                sourceType: 'godmode',
                skillPath: cleanName
            };
        }
    }

    return null;
}

// Remove YAML header block and return only the body content
function extractContent(raw) {
    const rows = raw.split('\n');
    let insideHeader = false;
    let headerDone = false;
    const body = [];

    for (const row of rows) {
        if (row.trim() === '---') {
            if (insideHeader) {
                headerDone = true;
                continue;
            }
            insideHeader = true;
            continue;
        }

        if (headerDone || !insideHeader) {
            body.push(row);
        }
    }

    return body.join('\n').trim();
}

export {
    parseFrontmatter,
    discoverProtocols,
    resolveProtocolPath,
    extractContent
};
