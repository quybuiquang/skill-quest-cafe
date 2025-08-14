import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Undo,
  Redo,
  ChevronDown,
  ChevronUp,
  Type,
  AlignLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OptimizedRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  compact?: boolean;
}

export function OptimizedRichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Nhập nội dung...",
  className,
  editable = true,
  compact = false
}: OptimizedRichTextEditorProps) {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
        defaultLanguage: 'javascript'
      })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose max-w-none focus:outline-none ${compact ? 'min-h-[100px] p-3' : 'min-h-[150px] p-4'}`
      }
    }
  });

  if (!editor) {
    return null;
  }

  const formatButtons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: 'bold', label: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic', label: 'Italic' },
  ];

  const headingButtons = [
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: { name: 'heading', attrs: { level: 1 } }, label: 'H1' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: { name: 'heading', attrs: { level: 2 } }, label: 'H2' },
  ];

  const listButtons = [
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList', label: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList', label: 'Ordered List' },
  ];

  const extraButtons = [
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote', label: 'Quote' },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: 'codeBlock', label: 'Code Block' },
  ];

  const historyButtons = [
    { icon: Undo, action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo(), label: 'Undo' },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo(), label: 'Redo' },
  ];

  const renderButton = (button: any, key: string) => (
    <Button
      key={key}
      variant="ghost"
      size="sm"
      onClick={button.action}
      disabled={button.disabled}
      className={cn(
        "h-8 w-8 p-0",
        typeof button.active === 'string' 
          ? editor.isActive(button.active) ? 'bg-muted' : ''
          : editor.isActive(button.active.name, button.active.attrs) ? 'bg-muted' : ''
      )}
      title={button.label}
    >
      <button.icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("border rounded-lg bg-background overflow-hidden", className)}>
      {editable && (
        <div className="border-b bg-muted/20">
          {/* Always visible essential tools */}
          <div className="flex flex-wrap items-center gap-1 p-2">
            {formatButtons.map((button, i) => renderButton(button, `format-${i}`))}
            <Separator orientation="vertical" className="h-6 mx-1" />
            {headingButtons.map((button, i) => renderButton(button, `heading-${i}`))}
            <Separator orientation="vertical" className="h-6 mx-1" />
            {historyButtons.map((button, i) => renderButton(button, `history-${i}`))}
            
            {/* Collapsible toggle for mobile */}
            <div className="ml-auto">
              <Collapsible open={isToolbarExpanded} onOpenChange={setIsToolbarExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isToolbarExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 pt-2 border-t">
                  <div className="flex flex-wrap items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Type className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mr-2">Lists:</span>
                      {listButtons.map((button, i) => renderButton(button, `list-${i}`))}
                    </div>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <div className="flex items-center gap-1">
                      <AlignLeft className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mr-2">Extra:</span>
                      {extraButtons.map((button, i) => renderButton(button, `extra-${i}`))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
        className="rich-text-content"
      />
    </div>
  );
}