import { visit } from 'unist-util-visit';

export function rehypeCodeCopy() {
    return (tree) => {
        visit(tree, 'element', (node) => {
            // Target pre > code elements
            if (node.tagName === 'pre' && node.children && node.children[0]?.tagName === 'code') {
                const codeNode = node.children[0];
                const codeContent = getTextContent(codeNode);

                // Wrap in a div with relative positioning
                const wrapper = {
                    type: 'element',
                    tagName: 'div',
                    properties: {
                        className: ['code-block-wrapper']
                    },
                    children: [
                        {
                            type: 'element',
                            tagName: 'button',
                            properties: {
                                className: ['copy-code-button'],
                                'data-code': codeContent,
                                'aria-label': 'Copy code',
                                title: 'Copy to clipboard'
                            },
                            children: [
                                {
                                    type: 'element',
                                    tagName: 'svg',
                                    properties: {
                                        className: ['copy-icon'],
                                        width: '16',
                                        height: '16',
                                        viewBox: '0 0 24 24',
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        strokeWidth: '2',
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round'
                                    },
                                    children: [
                                        {
                                            type: 'element',
                                            tagName: 'rect',
                                            properties: { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }
                                        },
                                        {
                                            type: 'element',
                                            tagName: 'path',
                                            properties: { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }
                                        }
                                    ]
                                },
                                {
                                    type: 'element',
                                    tagName: 'svg',
                                    properties: {
                                        className: ['check-icon', 'hidden'],
                                        width: '16',
                                        height: '16',
                                        viewBox: '0 0 24 24',
                                        fill: 'none',
                                        stroke: 'currentColor',
                                        strokeWidth: '2',
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round'
                                    },
                                    children: [
                                        {
                                            type: 'element',
                                            tagName: 'polyline',
                                            properties: { points: '20 6 9 17 4 12' }
                                        }
                                    ]
                                }
                            ]
                        },
                        node // The original pre element
                    ]
                };

                // Replace the pre node with the wrapper
                Object.assign(node, wrapper);
            }
        });
    };
}

function getTextContent(node) {
    if (node.type === 'text') {
        return node.value;
    }
    if (node.children) {
        return node.children.map(getTextContent).join('');
    }
    return '';
}
