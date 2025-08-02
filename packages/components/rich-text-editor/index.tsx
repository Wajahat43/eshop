import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  className?: string;
  readOnly?: boolean;
  theme?: 'snow' | 'bubble';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  label,
  name,
  className = '',
  readOnly = false,
  theme = 'snow',
}) => {
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  // Quill editor formats
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
    'video',
  ];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <style>{`
          .rich-text-editor-wrapper .ql-container {
            min-height: 500px;
          }
          .rich-text-editor-wrapper .quill-editor .ql-toolbar {
            border: 1px solid hsl(var(--input));
            background: hsl(var(--muted));
            border-radius: 0.375rem 0.375rem 0 0;
            border-bottom: none;
          }
          .rich-text-editor-wrapper .quill-editor .ql-container {
            border: 1px solid hsl(var(--input));
            background: hsl(var(--background));
            color: hsl(var(--foreground));
            border-radius: 0 0 0.375rem 0.375rem;
            min-height: 150px;
            font-family: inherit;
            font-size: 0.875rem;
          }
          .rich-text-editor-wrapper .quill-editor .ql-editor {
            padding: 1rem;
            min-height: 150px ;
          }
          .rich-text-editor-wrapper .quill-editor .ql-editor.ql-blank::before {
            color: hsl(var(--muted-foreground));
            font-style: italic;
          }
          .rich-text-editor-wrapper .quill-editor .ql-toolbar button {
            color: hsl(var(--foreground));
            transition: color 0.2s;
          }
          .rich-text-editor-wrapper .quill-editor .ql-toolbar button:hover,
          .rich-text-editor-wrapper .quill-editor .ql-toolbar button.ql-active {
            color: hsl(var(--primary));
          }
          .rich-text-editor-wrapper .quill-editor .ql-toolbar .ql-stroke {
            stroke: currentColor;
          }
          .rich-text-editor-wrapper .quill-editor .ql-toolbar .ql-fill {
            fill: currentColor;
          }
          .rich-text-editor-wrapper .quill-editor .ql-container:focus-within {
            outline: 2px solid hsl(var(--ring));
            outline-offset: 2px;
          }
        `}</style>
        <div className="rich-text-editor-wrapper">
          <ReactQuill
            theme={theme}
            value={editorValue}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            readOnly={readOnly}
            className="quill-editor"
          />
        </div>
      </div>
    </div>
  );
};
