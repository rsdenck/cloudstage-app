"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-slate max-w-none 
      prose-headings:font-bold prose-headings:text-white
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-code:text-blue-300 prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-transparent prose-pre:p-0
      prose-img:rounded-xl shadow-2xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return '';
  };

  const onCopy = () => {
    const text = extractText(children);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md border border-slate-600 transition-colors"
          title="Copiar código"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="!bg-slate-900 !p-6 rounded-xl overflow-x-auto shadow-lg border border-slate-800">
        {children}
      </pre>
    </div>
  );
}
