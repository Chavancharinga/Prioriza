import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { Mark, mergeAttributes } from '@tiptap/core'
import {
    Bold, Italic, Strikethrough, Heading1, Heading2,
    List, ListOrdered, Quote, Undo, Redo, Highlighter, Type
} from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

/**
 * Custom inline Mark for heading styles (H1 and H2 inline).
 */
const HeadingInline = Mark.create({
    name: 'headingInline',
    
    addOptions() {
        return { levels: [1, 2] }
    },

    addAttributes() {
        return {
            level: {
                default: 1,
                parseHTML: element => parseInt(element.getAttribute('data-level')) || 1,
                renderHTML: attributes => ({ 'data-level': attributes.level })
            }
        }
    },

    parseHTML() {
        return [{ tag: 'span[data-heading-inline]' }]
    },

    renderHTML({ HTMLAttributes }) {
        const level = HTMLAttributes['data-level'] || 1
        const styles = level === 1
            ? 'font-size:1.875em;font-weight:700;line-height:1.2;display:inline;'
            : 'font-size:1.5em;font-weight:600;line-height:1.25;display:inline;'
        return ['span', mergeAttributes(HTMLAttributes, { 'data-heading-inline': '', style: styles }), 0]
    }
})

const ToolbarButton = ({ onClick, isActive, disabled, children, title, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 md:p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 ${className} ${
            isActive
                ? 'bg-blue-100/50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
        } ${disabled ? 'opacity-30 cursor-not-allowed hidden md:flex' : ''}`}
    >
        {children}
    </button>
)

const MenuBar = ({ editor }) => {
    const [showColors, setShowColors] = useState(false)
    const highlightColors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e5e7eb']

    if (!editor) return null

    // Toggle H1/H2
    const toggleHeading = (level) => {
        if (editor.isActive('headingInline', { level })) {
            editor.chain().focus().unsetMark('headingInline').run()
        } else {
            editor.chain().focus().unsetMark('headingInline').setMark('headingInline', { level }).run()
        }
    }

    // Toggle color picker
    const togglePicker = () => {
        setShowColors(prev => !prev)
    }

    // Apply color - apply highlight to selected text
    const applyColor = (color) => {
        const { from, to } = editor.state.selection
        
        // Apply only if there's selected text
        if (from !== to) {
            editor.chain()
                .focus()
                .setHighlight({ color })
                .run()
        }
        
        setShowColors(false)
    }

    // Remove highlight
    const removeHighlight = () => {
        editor.chain().focus().unsetHighlight().run()
        setShowColors(false)
    }

    return (
        <div className="flex items-center gap-1 p-2 flex-wrap border-b border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-[#0f172a]/50 border-t border-x rounded-t-xl shrink-0 relative z-50">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Negrito"
            >
                <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Itálico"
            >
                <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Rasurado"
            >
                <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <ToolbarButton
                onClick={() => toggleHeading(1)}
                isActive={editor.isActive('headingInline', { level: 1 })}
                title="Título 1"
            >
                <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => toggleHeading(2)}
                isActive={editor.isActive('headingInline', { level: 2 })}
                title="Título 2"
            >
                <Heading2 className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Lista de Marcas"
            >
                <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Lista Numerada"
            >
                <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Citação"
            >
                <Quote className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {/* Highlight / Marca Texto */}
            <ToolbarButton
                onClick={togglePicker}
                isActive={showColors}
                title="Marca Texto"
            >
                <Highlighter className="w-4 h-4" />
            </ToolbarButton>

            {showColors && highlightColors.map(color => (
                <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-5 h-5 rounded-full border-2 border-white/10 dark:border-slate-600 hover:scale-125 hover:border-blue-400 transition-all  cursor-pointer shrink-0"
                    style={{ backgroundColor: color }}
                    title="Aplicar Cor"
                />
            ))}
            {showColors && editor.isActive('highlight') && (
                <button
                    type="button"
                    onClick={removeHighlight}
                    className="w-5 h-5 rounded-full border-2 border-white/10 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-400 hover:scale-125 transition-all bg-[#0A101A] dark:bg-slate-900 cursor-pointer shrink-0"
                    title="Remover Marca Texto"
                >
                    <Undo className="w-3 h-3" />
                </button>
            )}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

            <div className="hidden md:flex ml-auto items-center gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    title="Desfazer"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    title="Refazer"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarButton>
            </div>
        </div>
    )
}

export default function RichTextEditor({ content, onChange, readOnly = false, placeholder = "Start typing more notes here..." }) {
    const [wordCount, setWordCount] = useState({ words: 0, chars: 0 })

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            Placeholder.configure({
                placeholder: placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Highlight.configure({
                multicolor: true,
            }),
            HeadingInline,
        ],
        content: content || '',
        editable: !readOnly,
        onCreate: ({ editor }) => {
            const text = editor.getText()
            const words = text.trim() ? text.trim().split(/\s+/).length : 0
            setWordCount({ words, chars: text.length })
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
            // Update word count
            const text = editor.getText()
            const words = text.trim() ? text.trim().split(/\s+/).length : 0
            setWordCount({ words, chars: text.length })
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none p-4 w-full h-full min-h-[300px] text-slate-800 dark:text-slate-100',
            },
        },
    })

    useEffect(() => {
        if (editor && content !== undefined && editor.getHTML() !== content) {
            if (!editor.isFocused) {
                editor.commands.setContent(content || '')
            }
        }
    }, [content, editor])

    // Reading time estimate (avg 200 words/min)
    const readingTime = useMemo(() => {
        if (wordCount.words < 10) return null
        const mins = Math.ceil(wordCount.words / 200)
        return `~${mins} min leitura`
    }, [wordCount.words])

    return (
        <div className={`flex flex-col w-full h-full relative group ${readOnly ? 'opacity-80' : ''}`}>
            {!readOnly && <MenuBar editor={editor} />}
            <div className={`flex-1 bg-white dark:bg-[#0B1324] overflow-y-auto custom-scrollbar 
                 ${!readOnly ? 'border-x border-gray-200 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all' : 'bg-transparent dark:bg-transparent'}
            `}>
                <EditorContent editor={editor} className="h-full flex flex-col" />
            </div>
            {/* Word Count Status Bar */}
            {!readOnly && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-slate-900/50 border border-t-0 border-gray-200 dark:border-slate-700/50 rounded-b-xl text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-3">
                        <span>{wordCount.words} palavras</span>
                        <span className="text-slate-300 dark:text-slate-300">•</span>
                        <span>{wordCount.chars} caracteres</span>
                    </div>
                    {readingTime && (
                        <span className="text-slate-400 dark:text-slate-500">{readingTime}</span>
                    )}
                </div>
            )}
        </div>
    )
}