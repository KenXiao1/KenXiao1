import { visit } from 'unist-util-visit';

// Custom plugin to handle Obsidian-style image embeds
export function remarkObsidianImages() {
    return (tree) => {
        visit(tree, 'text', (node, index, parent) => {
            const obsidianImageRegex = /!\[\[(.*?)\]\]/g;
            const text = node.value;

            if (obsidianImageRegex.test(text)) {
                const newNodes = [];
                let lastIndex = 0;
                let match;

                obsidianImageRegex.lastIndex = 0;
                while ((match = obsidianImageRegex.exec(text)) !== null) {
                    // Add text before the match
                    if (match.index > lastIndex) {
                        newNodes.push({
                            type: 'text',
                            value: text.slice(lastIndex, match.index)
                        });
                    }

                    // Add the image node
                    const imageName = match[1];
                    newNodes.push({
                        type: 'image',
                        url: `/images/posts/${imageName}`,
                        alt: imageName,
                        title: null
                    });

                    lastIndex = match.index + match[0].length;
                }

                // Add remaining text
                if (lastIndex < text.length) {
                    newNodes.push({
                        type: 'text',
                        value: text.slice(lastIndex)
                    });
                }

                // Replace the text node with new nodes
                if (newNodes.length > 0) {
                    parent.children.splice(index, 1, ...newNodes);
                }
            }
        });
    };
}
