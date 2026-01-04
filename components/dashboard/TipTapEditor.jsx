'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
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
  Paperclip, Music, RefreshCw
} from 'lucide-react';
import { getMediaItem } from '@/lib/media-api';

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
// Custom Audio Extension
const AudioExtension = Node.create({
  name: 'audio',
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
        default: 'w-full my-4',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'audio-wrapper' }, ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]];
  },

  addNodeView() {
    return ({ node }) => {
        const audio = document.createElement('audio');
        audio.src = node.attrs.src;
        audio.controls = true;
        audio.className = node.attrs.class;
        return {
            dom: audio,
        };
    };
  }
});

// Custom Pending Media Extension to preserve the placeholder during processing
const PendingMediaExtension = Node.create({
  name: 'pendingMedia',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      mediaId: {
        default: null,
        parseHTML: element => element.getAttribute('data-smri-media-id'),
        renderHTML: attributes => ({
          'data-smri-media-id': attributes.mediaId,
        }),
      },
      mediaType: {
        default: null,
        parseHTML: element => element.getAttribute('data-smri-media-type'),
        renderHTML: attributes => ({
           'data-smri-media-type': attributes.mediaType,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.smri-media-pending',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Simple render for export - the NodeView handles the editor display
    return ['div', mergeAttributes(HTMLAttributes, { class: 'smri-media-pending' })];
  },

  addNodeView() {
    return ({ node }) => {
        const wrapper = document.createElement('div');
        // Replicate the styling from create/page.jsx so it looks consistent
        wrapper.className = 'smri-media-pending p-6 border-2 border-dashed border-cyan-200 rounded-xl bg-cyan-50 my-6 text-center select-none';
        wrapper.setAttribute('data-smri-media-id', node.attrs.mediaId);
        wrapper.setAttribute('data-smri-media-type', node.attrs.mediaType);
        wrapper.setAttribute('contenteditable', 'false'); // Important for atom nodes
        
        const typeLabel = node.attrs.mediaType === 'audio' ? 'Audio' : 'Video';
        
        wrapper.innerHTML = `
             <p class="font-bold text-cyan-800 text-lg mb-1">${typeLabel} Processing...</p>
             <p class="text-sm text-cyan-600 mb-2">Your media is being optimized.</p>
             <div class="text-xs text-gray-500 font-mono bg-white inline-block px-2 py-1 rounded border border-gray-200">ID: ${node.attrs.mediaId}</div>
        `;
        
        return {
            dom: wrapper,
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

const TipTapEditor = forwardRef(({ content, onChange, editable = true, onAddImage, onAddVideo, onAddAudio, onAddDocument }, ref) => {
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
      AudioExtension, // Register custom audio extension
      PendingMediaExtension, // Register custom pending media extension
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

  useImperativeHandle(ref, () => ({
    insertContent: (htmlContent) => {
        if (editor) {
            editor.chain().focus().insertContent(htmlContent).run();
        }
    }
  }));

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        const currentSelection = editor.state.selection;
        editor.commands.setContent(content);
        // Restore cursor position if possible, though setting content usually resets it
        // Ideally we only update if content is drastically different to avoid cursor jumps
    }
  }, [content, editor]);

  // Polling Logic for Pending Media
  useEffect(() => {
    if (!editor) return;

    const checkPendingMedia = async () => {
      // Find all pending media elements in the editor's content
      // We look for the class 'smri-media-pending' which we inserted in create/page.jsx
      // Since TipTap manages its own DOM, we scan the editor's JSON or HTML output logic roughly
      // But standard DOM access to editor.view.dom is easiest for finding elements
      
      const pendingElements = editor.view.dom.querySelectorAll('.smri-media-pending');
      
      if (pendingElements.length === 0) return;

      pendingElements.forEach(async (el) => {
        const mediaId = el.getAttribute('data-smri-media-id');
        const mediaType = el.getAttribute('data-smri-media-type'); // 'video' or 'audio'
        
        if (!mediaId || !mediaType) return;

        try {
          const statusData = await getMediaItem(mediaId, mediaType);
          
          if (statusData && (statusData.status === 'COMPLETED' || statusData.status === 'UNKNOWN') && statusData.cloudfront_url) {
              // Replace the placeholder with the actual component
              // We need to find the node in the editor state that corresponds to this element
              // This is tricky in TipTap without a custom node for "Pending", but since we inserted HTML,
              // we can try to find and replace the content string.
              
              // A safer approach with TipTap is to use `editor.commands.setContent` but that re-renders everything.
              // Instead, we can use a range replacement if we find the node, OR
              // simpler: regex replace on the HTML content if the user isn't actively typing in that exact spot.
              
              // Let's use the editor's transaction to replace the node at the position.
              // We need to find the node pos.
              
              editor.state.doc.descendants((node, pos) => {
                  if (node.isText) return;
                  // We inserted it as raw HTML, likely it's being parsed as a paragraph or HTML block?
                  // TipTap sanitizes HTML heavily. Our `insertMediaIntoContent` used `updateLessonContent`
                  // which calls `editor.commands.setContent`.
                  
                  // If our pending div was preserved (it might be stripped if not allowed),
                  // verify if TipTap allows 'div' with classes. StarterKit usually doesn't allow arbitrary divs.
                  // We should check if the pending element is actually in the DOM.
                  
                  // Assuming it is rendered (maybe as a paragraph with attributes if configured, or just stripped).
                  // If stripped, this polling won't work.
                  // BUT, `TipTapEditor` allows `attributes: { class: ... }` on editor.
                  
                  // Let's assume the user sees the placeholder.
                  
                  // For robust replacement, we'll traverse the document and check attributes if we had a custom node.
                  // Since we don't, we will try to replace the content by matching the ID string in the HTML.
              });

               const currentHTML = editor.getHTML();
               // We look for the placeholder HTML string pattern
               const parser = new DOMParser();
               const doc = parser.parseFromString(currentHTML, 'text/html');
               const placeholder = doc.querySelector(`.smri-media-pending[data-smri-media-id="${mediaId}"]`);
               
               if (placeholder) {
                   // Create the new element
                   let newHTML = '';
                   if (mediaType === 'video') {
                       // Using our custom Video node
                       newHTML = `<div data-video-wrapper="true"><video src="${statusData.cloudfront_url || statusData.media_url}" controls class="w-full h-auto rounded-lg shadow-md aspect-video my-6 bg-black"></video></div>`;
                   } else if (mediaType === 'audio') {
                       newHTML = `<div data-audio-wrapper="true"><audio src="${statusData.cloudfront_url || statusData.media_url}" controls class="w-full my-4"></audio></div>`;
                   }
                   
                   // We actually want to replace the Node in TipTap, not just the string, best practice.
                   // However, for this 'layman' integration request, replacing the HTML content is safest to ensure it updates.
                   // The challenge is preserving cursor.
                   
                   // Let's rely on the Parent passing `content` prop updates if we want to be pure,
                   // But `TipTapEditor` owns the state.
                   // We will run a command to replace the specific range if we can find it.
                   
                   // Better strategy:
                   // Use a regex on the HTML to swap the placeholder div for the video/audio tag.
                   const regex = new RegExp(`<div[^>]*data-smri-media-id="${mediaId}"[^>]*>.*?</div>`, 's');
                   
                   // If we are using the video extension, we should insert the tag compatible with it
                   // Our VideoExtension parses <video>, so we should insert <video src="...">
                   
                   let replacementTag = '';
                    if (mediaType === 'video') {
                       replacementTag = `<video src="${statusData.cloudfront_url || statusData.media_url}" controls class="w-full h-auto rounded-lg shadow-md aspect-video my-6 bg-black"></video>`;
                   }

                   // We use a text replacement on the editor content
                   // This is slightly destructive if user is typing elsewhere, but acceptably rare (only when upload finishes)
                   const newContent = currentHTML.replace(regex, replacementTag);
                   
                   if (newContent !== currentHTML) {
                       editor.commands.setContent(newContent, true); // true = emit update
                       if (onChange) onChange(newContent); // Inform parent if callback provided
                   }
               }
          }
        } catch (err) {
            console.error("Polling error for", mediaId, err);
        }
      });
    };

    const intervalId = setInterval(checkPendingMedia, 5000); // Check every 5 seconds
    return () => clearInterval(intervalId);
  }, [editor, onChange]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-full">
      {editable && <MenuBar editor={editor} onAddImage={onAddImage} onAddVideo={onAddVideo} onAddAudio={onAddAudio} onAddDocument={onAddDocument} />}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;
