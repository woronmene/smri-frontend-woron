'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { Extension, Node, mergeAttributes } from '@tiptap/core'; // Import Node, mergeAttributes for custom Extensions
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  List, ListOrdered, Quote, Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, 
  AlignLeft, AlignCenter, AlignRight, Type, Highlighter,
  Undo, Redo, Palette, Video, Plus, Minus,
  Paperclip, Music
} from 'lucide-react';

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Custom Video Extension
const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      class: {
        default: 'w-full h-auto rounded-lg shadow-md aspect-video my-6 bg-black',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'video-wrapper' }, ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]];
  },

  addNodeView() {
    return ({ node }) => {
        const video = document.createElement('video');
        video.src = node.attrs.src;
        video.controls = true;
        video.className = node.attrs.class;
        return {
            dom: video,
        };
    };
  }
});

const MenuBar = ({ editor, onAddImage, onAddVideo, onAddAudio, onAddDocument }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (onAddImage) {
        onAddImage();
        return;
    }
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 sticky top-0 z-10 items-center">
      {/* History */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Undo"><Undo size={16} /></button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Redo"><Redo size={16} /></button>
      </div>

      {/* Text Styles */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Bold"><Bold size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Italic"><Italic size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Underline"><UnderlineIcon size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Strikethrough"><Strikethrough size={16} /></button>
      </div>
      
      {/* Colors, FontFamily & Size */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
         <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} className="h-8 text-xs border border-gray-200 rounded px-1 bg-white w-24" value={editor.getAttributes('textStyle').fontFamily || ''}>
            <option value="">Default</option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Comic Sans MS">Comic Sans</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
         </select>
         
         <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()} className="h-8 text-xs border border-gray-200 rounded px-1 bg-white w-16" value={editor.getAttributes('textStyle').fontSize || ''}>
            <option value="">Size</option>
            <option value="12">12</option>
            <option value="14">14</option>
            <option value="16">16</option>
            <option value="18">18</option>
            <option value="20">20</option>
            <option value="24">24</option>
            <option value="30">30</option>
         </select>

         <div className="relative flex items-center">
            <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-8 h-8 p-0.5 border-none bg-transparent cursor-pointer" title="Text Color" />
         </div>
         <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-yellow-200 text-black' : 'text-gray-600'}`} title="Highlight"><Highlighter size={16} /></button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Heading 1"><Heading1 size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Heading 2"><Heading2 size={16} /></button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Bullet List"><List size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Ordered List"><ListOrdered size={16} /></button>
      </div>

      {/* Insert */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
         <button onClick={setLink} className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-600'}`} title="Link"><LinkIcon size={16} /></button>
          <button onClick={addImage} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Image"><ImageIcon size={16} /></button>
          <button onClick={onAddVideo} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Video"><Video size={16} /></button>
          <button onClick={onAddAudio} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Audio"><Music size={16} /></button>
          <button onClick={onAddDocument} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Document"><Paperclip size={16} /></button>
          <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Insert Table"><TableIcon size={16} /></button>
      </div>

      {/* Table Controls */}
      {editor.isActive('table') && (
        <div className="flex items-center gap-1">
           <button onClick={() => editor.chain().focus().deleteTable().run()} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">Del Table</button>
           <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="text-xs px-2 py-1 bg-gray-100 rounded">+Col</button>
           <button onClick={() => editor.chain().focus().addRowAfter().run()} className="text-xs px-2 py-1 bg-gray-100 rounded">+Row</button>
           <button onClick={() => editor.chain().focus().deleteColumn().run()} className="text-xs px-2 py-1 bg-gray-100 rounded">-Col</button>
           <button onClick={() => editor.chain().focus().deleteRow().run()} className="text-xs px-2 py-1 bg-gray-100 rounded">-Row</button>
        </div>
      )}
    </div>
  );
};

const TipTapEditor = ({ content, onChange, editable = true, onAddImage, onAddVideo, onAddAudio, onAddDocument }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-cyan-600 hover:underline cursor-pointer' } }),
      Image.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'border-collapse table-auto w-full my-4 border border-gray-300' } }),
      TableRow,
      TableHeader.configure({ HTMLAttributes: { class: 'bg-gray-100 border border-gray-300 p-2 font-bold text-left' } }),
      TableCell.configure({ HTMLAttributes: { class: 'border border-gray-300 p-2' } }),
      TextStyle,
      Color,
      FontFamily,
      FontSize, // Register custom extension
      VideoExtension, // Register custom video extension
      Highlight.configure({ multipart: true }),
    ],
    content: content,
    editable: editable,
    immediatelyRender: false, // Fix SSR hydration mismatch
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: { class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[300px] p-4' },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-full">
      {editable && <MenuBar editor={editor} onAddImage={onAddImage} onAddVideo={onAddVideo} onAddAudio={onAddAudio} onAddDocument={onAddDocument} />}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
};

export default TipTapEditor;
